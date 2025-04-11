import json
from jinja2 import Environment, FileSystemLoader
import os
import argparse
import pathlib
import re # For parsing

FIXED_FIRST_BAR_WIDTH_PX = 70 # Define fixed width for the first bar in pixels

def parse_value(value_str):
    """Attempts to parse a numeric value from currency/unit strings like $10.5M"""
    if not isinstance(value_str, str):
        return None
    # Remove currency symbols, commas, and whitespace
    cleaned_str = re.sub(r'[$,\s]', '', value_str)
    multiplier = 1
    if cleaned_str.endswith('M'):
        multiplier = 1_000_000
        cleaned_str = cleaned_str[:-1]
    elif cleaned_str.endswith('K'):
        multiplier = 1_000
        cleaned_str = cleaned_str[:-1]
    
    try:
        numeric_value = float(cleaned_str)
        return numeric_value * (multiplier / 1_000_000) # Keep scale in Millions for consistency
    except (ValueError, TypeError):
        return None # Return None if conversion fails

def calculate_bar_widths(data):
    """Calculates and adds rendered_width_px to each item in assetsSection columns."""
    if 'assetsSection' in data and 'columns' in data['assetsSection']:
        for column in data['assetsSection']['columns']:
            if 'items' in column and column['items']:
                first_item_value = None
                # Find the first item's value to use as baseline
                if column['items'][0].get('value'):
                    first_item_value = parse_value(column['items'][0]['value'])
                
                # Assign widths
                for i, item in enumerate(column['items']):
                    if i == 0:
                        # Always set fixed width for the first item
                        item['rendered_width_px'] = FIXED_FIRST_BAR_WIDTH_PX
                    else:
                        current_value = parse_value(item.get('value'))
                        if first_item_value and first_item_value > 0 and current_value is not None:
                            # Calculate width relative to the first item's value
                            proportional_width = round((current_value / first_item_value) * FIXED_FIRST_BAR_WIDTH_PX)
                            item['rendered_width_px'] = max(0, proportional_width) # Ensure non-negative width
                        else:
                            # If no value or baseline, assign 0 width
                            item['rendered_width_px'] = 0 
    return data

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
            raw_data = json.load(f)

        # Calculate widths and add them to the data dictionary
        data_with_widths = calculate_bar_widths(raw_data)

        # Set up Jinja2 environment
        template_dir = template_path.parent
        env = Environment(loader=FileSystemLoader(template_dir), autoescape=True)
        template = env.get_template(template_path.name)

        # Render the template with data (now including widths)
        html_content = template.render(data_with_widths)

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
    # Updated description
    parser = argparse.ArgumentParser(description="Generate HTML agenda from JSON data and a template.")
    parser.add_argument("data_file", help="Path to the input JSON data file.")
    # Updated output help text
    parser.add_argument("-o", "--output", default="generated_agenda.html", 
                        help="Path for the output HTML file (default: generated_agenda.html).")
    parser.add_argument("-t", "--template", default="template.html", 
                        help="Path to the HTML template file (default: template.html)")
    
    args = parser.parse_args()

    generate_html_agenda(args.data_file, args.template, args.output) 