"""
pdf_tools.py - Advanced Utility script for PDF operations:
- Encryption (AES-256 / RC4-128)
- Decryption
- Compression (Basic, Recommended, Extreme, Target Size, Grayscale, DPI downsampling)
- PDF Info & Diagnostics (Encryption check, Digital signature detection, Page count)
- Text extraction
"""
import sys
import os
import io
import json
import pypdf
from PIL import Image

def get_pdf_info(input_path, password=None):
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Archivo no encontrado: {input_path}")
    
    file_size = os.path.getsize(input_path)
    reader = pypdf.PdfReader(input_path)
    
    is_encrypted = reader.is_encrypted
    if is_encrypted and password:
        res = reader.decrypt(password)
        if res == 0:
            return {"error": "INVALID_PASSWORD", "isEncrypted": True, "fileSize": file_size}
    
    has_sig = False
    try:
        trailer_str = str(reader.trailer)
        if "/ByteRange" in trailer_str or "/Sig" in trailer_str:
            has_sig = True
        else:
            for page in reader.pages:
                if "/Annots" in page:
                    annots = page["/Annots"]
                    if hasattr(annots, "get_object"):
                        annots = annots.get_object()
                    if isinstance(annots, (list, pypdf.generic.ArrayObject)):
                        for a in annots:
                            obj = a.get_object() if hasattr(a, "get_object") else a
                            if isinstance(obj, dict) and obj.get("/Subtype") == "/Widget" and obj.get("/FT") == "/Sig":
                                has_sig = True
                                break
                if has_sig:
                    break
    except Exception:
        pass
    
    num_pages = len(reader.pages) if not is_encrypted or not reader.is_encrypted else 0
    return {
        "fileSize": file_size,
        "pageCount": num_pages,
        "isEncrypted": is_encrypted,
        "hasDigitalSignature": has_sig
    }

def process_images_on_page(page, quality=75, max_dimension=1600, grayscale=False):
    """Recompresses embedded images in a page with Pillow while preserving vectors & text."""
    res = page.get('/Resources')
    if hasattr(res, 'get_object'):
        res = res.get_object()
    if not res or '/XObject' not in res:
        return 0
    
    xobjs = res['/XObject']
    if hasattr(xobjs, 'get_object'):
        xobjs = xobjs.get_object()
    if not isinstance(xobjs, dict):
        return 0
    
    processed = 0
    for name, v in list(xobjs.items()):
        obj = v.get_object() if hasattr(v, 'get_object') else v
        if not isinstance(obj, dict) or obj.get('/Subtype') != '/Image':
            continue
        
        try:
            pil_img = obj.decode_as_image()
            if not pil_img:
                continue
            
            orig_len = len(obj.get_data()) if hasattr(obj, 'get_data') else 0
            
            # Grayscale or color conversion
            if grayscale:
                pil_img = pil_img.convert('L')
            elif pil_img.mode in ('RGBA', 'LA'):
                # Flatten alpha onto pure white background
                bg = Image.new('RGB', pil_img.size, (255, 255, 255))
                alpha = pil_img.split()[-1]
                bg.paste(pil_img, mask=alpha)
                pil_img = bg
            elif pil_img.mode != 'RGB':
                pil_img = pil_img.convert('RGB')
            
            # Downsampling
            orig_w, orig_h = pil_img.size
            if max(orig_w, orig_h) > max_dimension:
                scale = max_dimension / float(max(orig_w, orig_h))
                new_w = max(50, int(orig_w * scale))
                new_h = max(50, int(orig_h * scale))
                pil_img = pil_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            
            # Recompress as JPEG
            buf = io.BytesIO()
            pil_img.save(buf, format='JPEG', quality=quality, optimize=True)
            new_data = buf.getvalue()
            
            # Only replace if newly compressed data is strictly smaller
            if orig_len == 0 or len(new_data) < orig_len:
                pypdf.generic.StreamObject.set_data(obj, new_data)
                obj[pypdf.generic.NameObject('/Filter')] = pypdf.generic.NameObject('/DCTDecode')
                obj[pypdf.generic.NameObject('/Width')] = pypdf.generic.NumberObject(pil_img.width)
                obj[pypdf.generic.NameObject('/Height')] = pypdf.generic.NumberObject(pil_img.height)
                obj[pypdf.generic.NameObject('/Length')] = pypdf.generic.NumberObject(len(new_data))
                if grayscale:
                    obj[pypdf.generic.NameObject('/ColorSpace')] = pypdf.generic.NameObject('/DeviceGray')
                else:
                    obj[pypdf.generic.NameObject('/ColorSpace')] = pypdf.generic.NameObject('/DeviceRGB')
                processed += 1
        except Exception:
            # If any individual image cannot be decoded/recompressed, continue safely
            continue
            
    return processed

def run_single_compression_pass(input_path, output_path, opts, password=None):
    mode = opts.get('mode', 'recommended')
    quality = int(opts.get('quality', 75))
    dpi = int(opts.get('dpi', 150))
    downsample = opts.get('downsample', True)
    grayscale = opts.get('grayscale', False)
    remove_metadata = opts.get('remove_metadata', False)
    remove_thumbnails = opts.get('remove_thumbnails', True)
    optimize_streams = opts.get('optimize_streams', True)
    
    # Calculate max dimension based on DPI
    dpi_dimension_map = {
        72: 840,
        96: 1150,
        150: 1750,
        200: 2350,
        300: 3500
    }
    max_dimension = dpi_dimension_map.get(dpi, 1750)
    
    reader = pypdf.PdfReader(input_path)
    if reader.is_encrypted:
        if not password:
            raise ValueError("FILE_IS_ENCRYPTED_PASSWORD_REQUIRED")
        if reader.decrypt(password) == 0:
            raise ValueError("INVALID_PASSWORD")
    
    writer = pypdf.PdfWriter(clone_from=reader)
    
    for page in writer.pages:
        if optimize_streams:
            page.compress_content_streams()
        
        # Remove page thumbnails if requested
        if remove_thumbnails and '/Thumb' in page:
            del page['/Thumb']
        
        # In basic mode, we do NOT downsample images (lossless structural only)
        if mode != 'basic' and downsample:
            process_images_on_page(page, quality=quality, max_dimension=max_dimension, grayscale=grayscale)
        elif mode != 'basic' and grayscale:
            # User requested grayscale without dimension downsampling
            process_images_on_page(page, quality=quality, max_dimension=9999, grayscale=True)
            
    # Metadata optimization
    if remove_metadata:
        try:
            if hasattr(writer, 'remove_metadata'):
                writer.remove_metadata()
            elif '/Info' in writer._trailer:
                del writer._trailer['/Info']
        except Exception:
            pass
            
    # Compress duplicate and unreferenced objects
    try:
        writer.compress_identical_objects(remove_duplicates=True, remove_unreferenced=True)
    except Exception:
        try:
            writer.compress_identical_objects()
        except Exception:
            pass
            
    with open(output_path, 'wb') as f:
        writer.write(f)
        
    # Verify generated output PDF integrity
    verify_reader = pypdf.PdfReader(output_path)
    if len(verify_reader.pages) != len(reader.pages):
        raise ValueError(f"Integrity check failed: Page count mismatch ({len(verify_reader.pages)} vs {len(reader.pages)})")
    
    return os.path.getsize(output_path)

def compress_pdf_advanced(input_path, output_path, options_json_str):
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Archivo de entrada no encontrado: {input_path}")
        
    orig_size = os.path.getsize(input_path)
    opts = json.loads(options_json_str) if isinstance(options_json_str, str) else options_json_str
    
    mode = opts.get('mode', 'recommended')
    password = opts.get('password')
    target_size_kb = opts.get('target_size_kb')
    
    # Configure defaults according to compression mode
    if mode == 'basic':
        opts.setdefault('quality', 92)
        opts.setdefault('dpi', 300)
        opts['downsample'] = False
    elif mode == 'extreme':
        opts.setdefault('quality', 45)
        opts.setdefault('dpi', 96)
        opts['downsample'] = True
    else: # recommended
        opts.setdefault('quality', 75)
        opts.setdefault('dpi', 150)
        opts.setdefault('downsample', True)
        
    # Check general info first
    info = get_pdf_info(input_path, password)
    if info.get('error'):
        print(json.dumps({
            "status": "ERROR",
            "error": info['error'],
            "isEncrypted": True
        }))
        return

    # Pass 1: standard compression pass
    temp_pass_out = output_path + ".tmp.pdf"
    current_size = run_single_compression_pass(input_path, temp_pass_out, opts, password)
    
    target_achieved = True
    if target_size_kb and target_size_kb > 0:
        target_bytes = target_size_kb * 1024
        
        # Iterative passes if target not yet achieved
        if current_size > target_bytes:
            iter_levels = [
                {'dpi': 150, 'quality': 65, 'downsample': True},
                {'dpi': 120, 'quality': 55, 'downsample': True},
                {'dpi': 96, 'quality': 45, 'downsample': True},
                {'dpi': 72, 'quality': 38, 'downsample': True, 'grayscale': opts.get('grayscale', False) or False}
            ]
            
            for iter_opt in iter_levels:
                iter_config = dict(opts)
                iter_config.update(iter_opt)
                pass_size = run_single_compression_pass(input_path, temp_pass_out, iter_config, password)
                if pass_size < current_size:
                    current_size = pass_size
                if current_size <= target_bytes:
                    target_achieved = True
                    break
            
            if current_size > target_bytes:
                target_achieved = False
        else:
            target_achieved = True

    if os.path.exists(temp_pass_out):
        if os.path.exists(output_path):
            os.remove(output_path)
        os.rename(temp_pass_out, output_path)
    
    final_size = os.path.getsize(output_path)
    reduction_bytes = max(0, orig_size - final_size)
    reduction_percent = round((reduction_bytes / orig_size) * 100, 1) if orig_size > 0 else 0
    
    result = {
        "status": "SUCCESS",
        "originalSize": orig_size,
        "compressedSize": final_size,
        "reductionBytes": reduction_bytes,
        "reductionPercent": reduction_percent,
        "pageCount": info.get('pageCount', 0),
        "targetSizeAchieved": target_achieved if (target_size_kb and target_size_kb > 0) else None,
        "targetSizeKb": target_size_kb,
        "isEncrypted": info.get('isEncrypted', False),
        "hasDigitalSignature": info.get('hasDigitalSignature', False),
        "mode": mode
    }
    
    print("RESULT_JSON:" + json.dumps(result))

def encrypt_pdf(input_path, output_path, password):
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Archivo de entrada no encontrado: {input_path}")
    
    reader = pypdf.PdfReader(input_path)
    writer = pypdf.PdfWriter(clone_from=reader)
    
    try:
        writer.encrypt(user_password=password, owner_password=password + "_owner", algorithm="AES-256")
    except Exception:
        writer.encrypt(user_password=password, owner_password=password + "_owner", algorithm="RC4-128")
    
    with open(output_path, "wb") as f:
        writer.write(f)
    
    test_reader = pypdf.PdfReader(output_path)
    if not test_reader.is_encrypted:
        raise ValueError("Error al verificar: el archivo PDF no está cifrado.")
    if test_reader.decrypt(password) == 0:
        raise ValueError("Error al verificar: la contraseña configurada no descifra el PDF.")
    
    print(f"ENCRYPT_SUCCESS:{os.path.getsize(output_path)}")

def get_page_count(input_path):
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Archivo de entrada no encontrado: {input_path}")
    reader = pypdf.PdfReader(input_path)
    print(f"PAGE_COUNT:{len(reader.pages)}")

def decrypt_pdf(input_path, output_path, password):
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Archivo de entrada no encontrado: {input_path}")
    reader = pypdf.PdfReader(input_path)
    if not reader.is_encrypted:
        writer = pypdf.PdfWriter(clone_from=reader)
        with open(output_path, "wb") as f:
            writer.write(f)
        print("DECRYPT_SUCCESS:NOT_ENCRYPTED")
        return

    res = reader.decrypt(password)
    if res == 0:
        raise ValueError("INVALID_PASSWORD")
    
    writer = pypdf.PdfWriter(clone_from=reader)
    with open(output_path, "wb") as f:
        writer.write(f)
    print(f"DECRYPT_SUCCESS:{os.path.getsize(output_path)}")

def check_encryption(input_path):
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Archivo de entrada no encontrado: {input_path}")
    reader = pypdf.PdfReader(input_path)
    print(f"IS_ENCRYPTED:{1 if reader.is_encrypted else 0}")

def extract_text(input_path, output_json_path):
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Archivo de entrada no encontrado: {input_path}")
    reader = pypdf.PdfReader(input_path)
    pages_data = []
    for idx, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        pages_data.append({
            "pageNumber": idx + 1,
            "text": text,
            "width": float(page.mediabox.width),
            "height": float(page.mediabox.height),
            "rotation": int(page.rotation)
        })
    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(pages_data, f, ensure_ascii=False)
    print(f"EXTRACT_SUCCESS:{len(pages_data)}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python pdf_tools.py <command> [args...]")
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    try:
        if cmd == "info":
            input_path = sys.argv[2]
            pwd = sys.argv[3] if len(sys.argv) > 3 else None
            info = get_pdf_info(input_path, pwd)
            print("INFO_JSON:" + json.dumps(info))
        elif cmd == "compress_advanced":
            input_path = sys.argv[2]
            output_path = sys.argv[3]
            opts_json = sys.argv[4] if len(sys.argv) > 4 else "{}"
            compress_pdf_advanced(input_path, output_path, opts_json)
        elif cmd == "compress":
            input_path = sys.argv[2]
            output_path = sys.argv[3]
            level = sys.argv[4] if len(sys.argv) > 4 else "medium"
            # Map legacy level to advanced options
            mode_map = {"low": "basic", "medium": "recommended", "high": "extreme"}
            opts = {"mode": mode_map.get(level, "recommended")}
            compress_pdf_advanced(input_path, output_path, json.dumps(opts))
        elif cmd == "encrypt":
            input_path = sys.argv[2]
            output_path = sys.argv[3]
            password = sys.argv[4]
            encrypt_pdf(input_path, output_path, password)
        elif cmd == "page_count":
            input_path = sys.argv[2]
            get_page_count(input_path)
        elif cmd == "decrypt":
            input_path = sys.argv[2]
            output_path = sys.argv[3]
            password = sys.argv[4]
            decrypt_pdf(input_path, output_path, password)
        elif cmd == "check_encryption":
            input_path = sys.argv[2]
            check_encryption(input_path)
        elif cmd == "extract_text":
            input_path = sys.argv[2]
            output_path = sys.argv[3]
            extract_text(input_path, output_path)
        else:
            print(f"Unknown command: {cmd}", file=sys.stderr)
            sys.exit(1)
    except Exception as err:
        print(f"ERROR:{str(err)}", file=sys.stderr)
        sys.exit(1)
