import os

def fix_file(path):
    try:
        # Read the file
        with open(path, 'rb') as f:
            raw_content = f.read()
        
        # Detect/Try encodings
        text = None
        for enc in ['utf-8-sig', 'utf-8', 'utf-16', 'latin-1']:
            try:
                text = raw_content.decode(enc)
                break
            except UnicodeDecodeError:
                continue
        
        if text is None:
            print(f"Could not decode {path}")
            return

        # Perform replacements
        new_text = text.replace('<DashboardLayout role="ADMIN"', '<DashboardLayout role="admin"')
        new_text = new_text.replace('<DashboardLayout role="TRAINER"', '<DashboardLayout role="trainer"')
        
        # Standardise newlines and encoding to UTF-8 without BOM
        with open(path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(new_text)
            
    except Exception as e:
        print(f"Error fixing {path}: {e}")

root = r'd:\MuhsinStuff\projects\ishow\src\app'
for dirpath, dirnames, filenames in os.walk(root):
    for f in filenames:
        if f.endswith('.tsx'):
            fix_file(os.path.join(dirpath, f))
    
# Also fix DashboardLayout itself
fix_file(r'd:\MuhsinStuff\projects\ishow\src\components\DashboardLayout.tsx')
