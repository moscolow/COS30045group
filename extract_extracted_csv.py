import pandas as pd

# Define Southeast Asian countries
southeast_asia_countries = [
    "Brunei Darussalam", "Cambodia", "Indonesia", "Lao People's Democratic Republic", "Malaysia", 
    "Myanmar", "Philippines", "Singapore", "Thailand", "Timor-Leste", "Viet Nam"
]

# Load dataset in chunks
csv_iterator = pd.read_csv('southeast_asia_data.csv', iterator=True, chunksize=4000)

# Process each chunk
processed_chunks = []
for chunk in csv_iterator:
    # Filter rows where 'Age' is 'All'
    # chunk = chunk[chunk['Age'] == 'All']
    
    # Extract only the required columns
    chunk = chunk[['Country', 'Year', 'Value', 'Age']]
    processed_chunks.append(chunk)

# Combine all processed chunks into a single DataFrame
df = pd.concat(processed_chunks, ignore_index=True)

# Save the processed data to a new CSV file
df.to_csv('southeast_asia_data_number.csv', index=False)
