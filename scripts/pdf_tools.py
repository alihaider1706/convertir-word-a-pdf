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

def parse_page_range(range_str, total_pages):
    if not range_str or str(range_str).strip().lower() in ('all', '', '*', 'null', 'undefined'):
        return list(range(1, total_pages + 1))
    pages = set()
    parts = [p.strip() for p in str(range_str).split(',') if p.strip()]
    for part in parts:
        if '-' in part:
            subparts = part.split('-')
            if len(subparts) == 2 and subparts[0].isdigit() and subparts[1].isdigit():
                start = max(1, int(subparts[0]))
                end = min(total_pages, int(subparts[1]))
                if start <= end:
                    for p in range(start, end + 1):
                        pages.add(p)
        elif part.isdigit():
            p = int(part)
            if 1 <= p <= total_pages:
                pages.add(p)
    sorted_pages = sorted(list(pages))
    if not sorted_pages:
        return list(range(1, total_pages + 1))
    return sorted_pages

def extract_for_ppt(input_path, output_json_path, options_json_str="{}"):
    import uuid
    import pymupdf

    opts = json.loads(options_json_str) if isinstance(options_json_str, str) else (options_json_str or {})
    mode = opts.get('mode', 'editable') # 'editable' or 'fidelity'
    password = opts.get('password')
    page_range_str = opts.get('page_range')

    doc = pymupdf.open(input_path)
    if doc.is_encrypted:
        if not password:
            raise ValueError("FILE_IS_ENCRYPTED_PASSWORD_REQUIRED")
        if not doc.authenticate(password):
            raise ValueError("INVALID_PASSWORD")

    total_pages = len(doc)
    selected_pages = parse_page_range(page_range_str, total_pages)

    out_dir = os.path.dirname(output_json_path)
    assets_dir = os.path.join(out_dir, f"ppt_assets_{uuid.uuid4().hex[:8]}")
    os.makedirs(assets_dir, exist_ok=True)

    slides = []

    for page_num in selected_pages:
        page_idx = page_num - 1
        page = doc[page_idx]
        rect = page.rect
        width_pt = float(rect.width)
        height_pt = float(rect.height)
        is_landscape = width_pt >= height_pt

        bg_img_path = None
        if mode == 'fidelity':
            pix = page.get_pixmap(dpi=150)
            bg_img_path = os.path.join(assets_dir, f"slide_bg_{page_num}.png")
            pix.save(bg_img_path)

        text_blocks = []
        text_dict = page.get_text("dict")
        raw_blocks = text_dict.get("blocks", [])

        total_text_length = 0

        for b in raw_blocks:
            if b.get("type") == 0 and "lines" in b: # Text block
                block_lines = []
                block_text = ""
                for line in b["lines"]:
                    line_spans = []
                    for span in line.get("spans", []):
                        s_text = span.get("text", "")
                        if not s_text:
                            continue
                        block_text += s_text
                        total_text_length += len(s_text.strip())

                        raw_color = span.get("color", 0)
                        if isinstance(raw_color, int):
                            r = (raw_color >> 16) & 255
                            g = (raw_color >> 8) & 255
                            b_val = raw_color & 255
                            hex_color = f"{r:02X}{g:02X}{b_val:02X}"
                        else:
                            hex_color = "1E293B"

                        flags = span.get("flags", 0)
                        font_name = str(span.get("font", "")).lower()
                        is_bold = bool((flags & 2) or "bold" in font_name or "black" in font_name or "heavy" in font_name or "semibold" in font_name)
                        is_italic = bool((flags & 4) or "italic" in font_name or "oblique" in font_name)

                        line_spans.append({
                            "text": s_text,
                            "size": round(float(span.get("size", 11)), 1),
                            "font": span.get("font", "Arial"),
                            "color": hex_color,
                            "isBold": is_bold,
                            "isItalic": is_italic,
                            "bbox": [round(float(x), 2) for x in span.get("bbox", [0, 0, 0, 0])]
                        })

                    if line_spans:
                        block_lines.append({
                            "spans": line_spans,
                            "bbox": [round(float(x), 2) for x in line.get("bbox", [0, 0, 0, 0])]
                        })

                if block_lines:
                    b_box = [round(float(x), 2) for x in b.get("bbox", [0, 0, 0, 0])]
                    text_blocks.append({
                        "bbox": b_box,
                        "lines": block_lines,
                        "fullText": block_text
                    })

        tables_data = []
        try:
            tabs = page.find_tables()
            for tab in tabs:
                extracted_rows = tab.extract()
                if extracted_rows and len(extracted_rows) > 0:
                    clean_rows = []
                    for row in extracted_rows:
                        clean_rows.append([str(c or "") for c in row])
                    tables_data.append({
                        "bbox": [round(float(x), 2) for x in tab.bbox],
                        "rows": clean_rows
                    })
        except Exception:
            pass

        images_data = []
        if mode == 'editable':
            try:
                img_infos = page.get_image_info(xrefs=True)
                seen_xrefs = set()
                for idx_img, img_info in enumerate(img_infos):
                    xref = img_info.get("xref")
                    bbox = img_info.get("bbox")
                    if not bbox or (xref and xref in seen_xrefs):
                        continue
                    if xref:
                        seen_xrefs.add(xref)
                    try:
                        base_img = doc.extract_image(xref) if xref else None
                        if base_img and "image" in base_img:
                            img_ext = base_img.get("ext", "png")
                            img_filename = f"img_p{page_num}_{idx_img}.{img_ext}"
                            img_full_path = os.path.join(assets_dir, img_filename)
                            with open(img_full_path, "wb") as f_img:
                                f_img.write(base_img["image"])
                            images_data.append({
                                "bbox": [round(float(x), 2) for x in bbox],
                                "path": img_full_path
                            })
                    except Exception:
                        pass
            except Exception:
                pass

        is_scanned = (total_text_length < 25 and len(images_data) == 0 and len(tables_data) == 0)
        if is_scanned and not bg_img_path:
            pix = page.get_pixmap(dpi=150)
            bg_img_path = os.path.join(assets_dir, f"scanned_bg_{page_num}.png")
            pix.save(bg_img_path)

        slides.append({
            "pageNumber": page_num,
            "widthPt": round(width_pt, 2),
            "heightPt": round(height_pt, 2),
            "isLandscape": is_landscape,
            "isScanned": is_scanned,
            "bgImagePath": bg_img_path,
            "textBlocks": text_blocks,
            "tables": tables_data,
            "images": images_data
        })

    result = {
        "totalPages": total_pages,
        "selectedPagesCount": len(slides),
        "mode": mode,
        "assetsDir": assets_dir,
        "slides": slides
    }

    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False)

    print(f"EXTRACT_PPT_SUCCESS:{len(slides)}")

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
        elif cmd == "extract_for_ppt":
            input_path = sys.argv[2]
            output_path = sys.argv[3]
            opts_json = sys.argv[4] if len(sys.argv) > 4 else "{}"
            extract_for_ppt(input_path, output_path, opts_json)
        else:
            print(f"Unknown command: {cmd}", file=sys.stderr)
            sys.exit(1)
    except Exception as err:
        print(f"ERROR:{str(err)}", file=sys.stderr)
        sys.exit(1)
