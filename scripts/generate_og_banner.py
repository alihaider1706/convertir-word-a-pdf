import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

width, height = 1200, 630
img = Image.new("RGBA", (width, height), (11, 19, 43, 255))
draw = ImageDraw.Draw(img)

# 1. Subtle radial/directional gradient
for y in range(height):
    ratio_y = y / height
    for x in range(0, width, 4):
        ratio_x = x / width
        # Gradient from deep dark navy to vivid electric indigo/blue on top-right
        r = int(10 + 20 * ratio_x + 10 * ratio_y)
        g = int(22 + 45 * ratio_x + 15 * ratio_y)
        b = int(55 + 160 * ratio_x + 50 * ratio_y)
        draw.rectangle([x, y, x + 4, y + 1], fill=(r, g, b, 255))

# 2. Glowing ambient orb in the upper right
glow_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow_layer)
center_x, center_y = 950, 150
for radius in range(350, 20, -10):
    alpha = int(35 * (1 - radius / 350))
    glow_draw.ellipse(
        [center_x - radius, center_y - radius, center_x + radius, center_y + radius],
        fill=(59, 130, 246, alpha)
    )
img = Image.alpha_composite(img, glow_layer)
draw = ImageDraw.Draw(img)

# 3. Soft grid lines
for gx in range(60, width, 60):
    draw.line([(gx, 0), (gx, height)], fill=(255, 255, 255, 12), width=1)
for gy in range(60, height, 60):
    draw.line([(0, gy), (width, gy)], fill=(255, 255, 255, 12), width=1)

# 4. Load or render Concept B logo icon
icon_path = os.path.join(os.path.dirname(__file__), "..", "public", "icon-192.png")
if os.path.exists(icon_path):
    logo = Image.open(icon_path).convert("RGBA")
    logo = logo.resize((120, 120), Image.Resampling.LANCZOS)
    img.paste(logo, (90, 110), logo)
else:
    # Fallback squircle
    draw.rounded_rectangle([90, 110, 210, 230], radius=28, fill=(37, 99, 235))

# 5. Fonts
try:
    font_brand = ImageFont.truetype("arialbd.ttf", 28)
    font_title = ImageFont.truetype("arialbd.ttf", 62)
    font_sub = ImageFont.truetype("arial.ttf", 26)
    font_badge = ImageFont.truetype("arialbd.ttf", 19)
    font_url = ImageFont.truetype("arialbd.ttf", 22)
except:
    font_brand = font_title = font_sub = font_badge = font_url = ImageFont.load_default()

# 6. Typography
draw.text((230, 132), "PLATAFORMA DOCUMENTAL ONLINE", font=font_brand, fill=(147, 197, 253, 255))
draw.text((230, 172), "CONVERTIR WORD A PDF", font=font_title, fill=(255, 255, 255, 255))

draw.text((90, 280), "Transforma, edita y comprime documentos DOC, DOCX y PDF", font=font_title, fill=(255, 255, 255, 255))
draw.text((90, 365), "Conversión instantánea con preservación milimétrica de fuentes, tablas e imágenes.", font=font_sub, fill=(203, 213, 225, 255))
draw.text((90, 405), "Sin necesidad de instalar software. 100% privado con purga automática en 1 hora.", font=font_sub, fill=(148, 163, 184, 255))

# 7. Badges Row
badges = [
    ("⚡ 100% Gratuito", (30, 58, 138), (191, 219, 254)),
    ("🔒 Cifrado SSL TLS 1.3", (20, 83, 45), (187, 247, 208)),
    ("✨ Reconstrucción Fidedigna", (88, 28, 135), (233, 213, 255)),
    ("📱 Soporte Multiplataforma", (124, 45, 18), (254, 215, 170)),
]

bx = 90
by = 480
for text, bg_col, text_col in badges:
    bbox = draw.textbbox((0, 0), text, font=font_badge)
    bw = (bbox[2] - bbox[0]) + 30
    bh = 40
    draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=12, fill=bg_col + (200,))
    draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=12, outline=text_col + (80,), width=1)
    draw.text((bx + 15, by + 10), text, font=font_badge, fill=text_col + (255,))
    bx += bw + 15

# 8. Bottom bar
draw.line([(90, 560), (1110, 560)], fill=(255, 255, 255, 25), width=1)
draw.text((90, 578), "convertirwordapdf.net", font=font_url, fill=(96, 165, 250, 255))
draw.text((950, 578), "© 2026 Todos los derechos reservados", font=font_badge, fill=(100, 116, 139, 255))

out_path = os.path.join(os.path.dirname(__file__), "..", "public", "og-image.png")
img.save(out_path, "PNG", optimize=True)
print("Saved 1200x630 OG Banner to:", out_path)
