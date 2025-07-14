#!/usr/bin/env python3
import sys
import json

try:
    from paddleocr import PaddleOCR
except Exception as e:
    print(
        json.dumps({"error": f"PaddleOCR not installed: {e}"}),
        file=sys.stderr,
    )
    sys.exit(1)

def main():
    if len(sys.argv) < 2:
        print('Usage: paddleocr_cli.py <image>', file=sys.stderr)
        return 1
    image_path = sys.argv[1]
    ocr = PaddleOCR(use_angle_cls=False, use_space_char=True, use_gpu=False)
    result = ocr.ocr(image_path, cls=False)
    texts = []
    for res in result:
        for line in res:
            if len(line) >= 2:
                texts.append(line[1][0])
    print(json.dumps({'text': ' '.join(texts)}, ensure_ascii=False))

if __name__ == '__main__':
    sys.exit(main())
