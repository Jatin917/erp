
export const CsvInstructions = () => (
  <div className="bg-gray-900 p-4 rounded-lg text-sm space-y-1">
    <p>1. Your CSV must have headers as shown in the sample file.</p>
    <p>2. Ensure file is UTF-8 formatted to avoid encoding issues.</p>
    <p>3. Duplicate Admission Numbers will not be imported.</p>
    <p>4. Gender: Male/Female only.</p>
    <p>5. Blood Groups: O+, A+, B+, etc.</p>
    <p>6. For RTE: Yes/No.</p>
    <p>7. Guardian type: father/mother/other.</p>
    <p>8. Category/House values must match backend IDs.</p>
  </div>
);
