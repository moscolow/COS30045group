#extract the huge csv raw data into csv for us to easy access the data
import pandas as pd

# Define Southeast Asian countries
southeast_asia_countries = [
    "Brunei Darussalam", "Cambodia", "Indonesia", "Lao People's Democratic Republic", "Malaysia", 
    "Myanmar", "Philippines", "Singapore", "Thailand", "Timor-Leste", "Viet Nam"
]

# Load dataset in chunks
csv_iterator = pd.read_csv('data/EXP_MORSC-2020-1-EN-20210323T100329.csv', iterator=True, chunksize=4000)

# Process each chunk
processed_chunks = []
for chunk in csv_iterator:
    # Standardize country names
    chunk['Country'] = chunk['Country'].str.strip().str.title()

    # Filter necessary columns and remove rows with missing 'Value'
    chunk = chunk[['Country', 'Year', 'Risk','Variable', 'Value','Unit', 'Sex', 'Age']]
    chunk = chunk.dropna(subset=['Value'])
    
    # Filter rows for Southeast Asian countries and 'Sex' == 'Both'
    chunk = chunk[(chunk['Country'].isin(southeast_asia_countries)) 
                 & (chunk['Sex'] == 'Both') &
                  (chunk['Risk'] == 'Ambient Particulate Matter') &
                  (chunk['Unit'] == 'Number') & #change 'Number' to 'Percentage' if you want to extract the percentage data
                #   (chunk['Age'] == 'All') #change 'All ages' to '0-4 years' if you want to extract the 0-4 years data
                 (chunk['Variable'] == 'DALYs')
                ]
    processed_chunks.append(chunk)

# Combine all processed chunks into a single DataFrame
df = pd.concat(processed_chunks, ignore_index=True)

# Save the processed data to a CSV file
df.to_csv('southeast_asia_data.csv', index=False) #remember to change name if extracting diff data to prevent overlapping
