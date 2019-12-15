import json
import sys

with open(sys.argv[1], 'r') as in_file:
    lines = [line.strip() for line in in_file.readlines() if not line.startswith("#")]
    json_string = json.dumps(lines, indent=2, separators=(',', ':'))
    with open(sys.argv[2], 'w') as out_file:
        out_file.write(json_string)
