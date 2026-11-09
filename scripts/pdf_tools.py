"""
pdf_tools.py - Utility script for PDF password encryption and compression using pypdf
"""
import sys
import os
import pypdf

def encrypt_pdf(input_path, output_path, password):
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Archivo de entrada no encontrado: {input_path}")
    
    reader = pypdf.PdfReader(input_path)
    writer = pypdf.PdfWriter(clone_from=reader)
    
    # Try AES-256 first, fallback to RC4-128 if needed
    try:
        writer.encrypt(user_password=password, owner_password=password + "_owner", algorithm="AES-256")
    except Exception as e:
        writer.encrypt(user_password=password, owner_password=password + "_owner", algorithm="RC4-128")
    
    with open(output_path, "wb") as f:
        writer.write(f)
    
    # Verify by opening and decrypting
    test_reader = pypdf.PdfReader(output_path)
    if not test_reader.is_encrypted:
        raise ValueError("Error al verificar: el archivo PDF no está cifrado.")
    if test_reader.decrypt(password) == 0:
        raise ValueError("Error al verificar: la contraseña configurada no descifra el PDF.")
    
    print(f"ENCRYPT_SUCCESS:{os.path.getsize(output_path)}")

def compress_pdf(input_path, output_path, level="medium"):
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Archivo de entrada no encontrado: {input_path}")
    
    original_size = os.path.getsize(input_path)
    reader = pypdf.PdfReader(input_path)
    writer = pypdf.PdfWriter(clone_from=reader)
    
    for page in writer.pages:
        page.compress_content_streams()
    
    try:
        writer.compress_identical_objects(remove_duplicates=True, remove_unreferenced=True)
    except Exception:
        try:
            writer.compress_identical_objects()
        except Exception:
            pass
    
    with open(output_path, "wb") as f:
        writer.write(f)
    
    new_size = os.path.getsize(output_path)
    print(f"COMPRESS_SUCCESS:{original_size}:{new_size}")

def get_page_count(input_path):
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Archivo de entrada no encontrado: {input_path}")
    reader = pypdf.PdfReader(input_path)
    print(f"PAGE_COUNT:{len(reader.pages)}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python pdf_tools.py <encrypt|compress|page_count> [args...]")
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    try:
        if cmd == "encrypt":
            input_path = sys.argv[2]
            output_path = sys.argv[3]
            password = sys.argv[4]
            encrypt_pdf(input_path, output_path, password)
        elif cmd == "compress":
            input_path = sys.argv[2]
            output_path = sys.argv[3]
            level = sys.argv[4] if len(sys.argv) > 4 else "medium"
            compress_pdf(input_path, output_path, level)
        elif cmd == "page_count":
            input_path = sys.argv[2]
            get_page_count(input_path)
        else:
            print(f"Unknown command: {cmd}")
            sys.exit(1)
    except Exception as err:
        print(f"ERROR:{str(err)}", file=sys.stderr)
        sys.exit(1)
