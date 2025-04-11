import json
from jinja2 import Environment, FileSystemLoader
import os
import argparse
import pathlib # Keep pathlib for robust path handling

def generate_html_agenda(data_file, template_file, output_file):
    """Generates an HTML agenda file from JSON data and a Jinja2 template.
    
    Args:
        data_file (str): Path to the JSON data file.
        template_file (str): Path to the Jinja2 HTML template file.
        output_file (str): Path for the generated HTML output file.
    """
    try:
        # Get the directory of the script and ensure paths are absolute
        script_dir = pathlib.Path(__file__).parent.resolve()
        data_path = script_dir / data_file if not os.path.isabs(data_file) else pathlib.Path(data_file)
        template_path = script_dir / template_file # Template always relative to script
        output_html_path = script_dir / output_file if not os.path.isabs(output_file) else pathlib.Path(output_file)
        
        # Ensure output directory exists
        output_html_path.parent.mkdir(parents=True, exist_ok=True)

        # Load data from JSON file
        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Set up Jinja2 environment
        template_dir = template_path.parent
        env = Environment(loader=FileSystemLoader(template_dir), autoescape=True)
        template = env.get_template(template_path.name)

        # Render the template with data
        html_content = template.render(data)

        # --- Write HTML --- 
        with open(output_html_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        print(f"Successfully generated HTML agenda: {output_html_path}")

    except FileNotFoundError as e:
        print(f"Error: File not found - {e}")
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON from {data_file}: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate HTML agenda from JSON data and a template.")
    parser.add_argument("data_file", help="Path to the input JSON data file.")
    parser.add_argument("-o", "--output", default="generated_agenda.html", 
                        help="Path for the output HTML file (default: generated_agenda.html).")
    parser.add_argument("-t", "--template", default="template.html", 
                        help="Path to the HTML template file (default: template.html)")
    
    args = parser.parse_args()

    generate_html_agenda(args.data_file, args.template, args.output) 