from pathlib import Path

output_dir = Path(__file__).resolve().parent.parent / 'public' / 'resumes'
output_dir.mkdir(parents=True, exist_ok=True)

template = 'BT\n/F1 18 Tf\n72 720 Td\n({text}) Tj\nET\n'

for i in range(1, 4):
    text = f'Resume {i} placeholder'
    contents = template.format(text=text)

    lines = [
        '%PDF-1.1',
        '1 0 obj',
        '<< /Type /Catalog /Pages 2 0 R >>',
        'endobj',
        '2 0 obj',
        '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        'endobj',
        '3 0 obj',
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
        'endobj',
        '4 0 obj',
        f'<< /Length {len(contents.encode("latin1"))} >>',
        'stream',
        contents.rstrip('\n'),
        'endstream',
        'endobj',
        '5 0 obj',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        'endobj',
    ]

    body = '\n'.join(lines) + '\n'
    offsets = []
    idx = 0
    for line in body.splitlines(True):
        offsets.append(idx)
        idx += len(line.encode('latin1'))

    xref = [
        'xref',
        '0 6',
        '0000000000 65535 f',
        f'{offsets[0]:010d} 00000 n',
        f'{offsets[4]:010d} 00000 n',
        f'{offsets[8]:010d} 00000 n',
        f'{offsets[13]:010d} 00000 n',
        f'{offsets[18]:010d} 00000 n',
    ]

    trailer = (
        'trailer\n'
        '<< /Size 6 /Root 1 0 R >>\n'
        'startxref\n'
        f'{len(body.encode("latin1"))}\n'
        '%%EOF\n'
    )

    pdf = body + '\n'.join(xref) + '\n' + trailer
    path = output_dir / f'resume-{i}.pdf'
    path.write_bytes(pdf.encode('latin1'))
    print('wrote', path)
