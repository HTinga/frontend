import React, { useState } from 'react';

/**
 * FileUpload Question Component
 * Renders the UI for a file upload question, supporting both builder (editable) and respondent (upload) modes.
 *
 * @param {object} props - Component props
 * @param {object} props.question - The question object containing allowedFileTypes.
 * @param {function} [props.updateQuestion] - Function to update the question's fields (only in builder mode).
 * @param {boolean} [props.isBuilder=false] - True if in survey builder mode, false for respondent mode.
 * @param {function} [props.onAnswerChange] - Callback when a file is successfully uploaded (for respondent mode).
 * @param {string} [props.answer] - The URL of the currently uploaded file (for respondent mode).
 */
const FileUpload = ({
    question,
    updateQuestion,
    isBuilder = false,
    onAnswerChange,
    answer // This will hold the URL of the uploaded file in respondent mode
}) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');
    const [uploadMessageType, setUploadMessageType] = useState(''); // 'success' or 'error'

    // Function to simulate file upload (replace with actual API call)
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        setUploading(true);
        setUploadMessage('');
        setUploadMessageType('');

        // Basic client-side validation for allowed file types
        if (question.allowedFileTypes) {
            const allowedTypesArray = question.allowedFileTypes.split(',').map(type => type.trim().toLowerCase());
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            const fileMimeType = file.type.toLowerCase();

            let typeAllowed = false;
            for (const allowedType of allowedTypesArray) {
                if (allowedType.startsWith('.')) { // Check by extension
                    if (fileExtension === allowedType) {
                        typeAllowed = true;
                        break;
                    }
                } else if (allowedType.includes('/')) { // Check by MIME type (e.g., image/, application/pdf)
                    if (fileMimeType.startsWith(allowedType.replace('*', ''))) { // Allows "image/*" to match "image/png"
                        typeAllowed = true;
                        break;
                    }
                }
            }

            if (!typeAllowed) {
                setUploadMessage(`File type "${fileExtension}" is not allowed. Allowed types: ${question.allowedFileTypes}`);
                setUploadMessageType('error');
                setUploading(false);
                setSelectedFile(null);
                e.target.value = null; // Clear the input
                return;
            }
        }


        // Simulate API call
        try {
            // In a real application, you would send 'file' to your backend API
            // const formData = new FormData();
            // formData.append('file', file);
            // const response = await API.post('/api/upload', formData); // Replace with your actual upload endpoint
            // const uploadedFileUrl = response.data.url; // Assuming your backend returns the URL

            // For demonstration, we'll just create a mock URL
            const mockFileUrl = `https://example.com/uploads/${Date.now()}-${file.name}`;

            setUploadMessage(`File "${file.name}" uploaded successfully!`);
            setUploadMessageType('success');
            if (onAnswerChange) {
                onAnswerChange(mockFileUrl); // Pass the URL to the parent component
            }
        } catch (error) {
            setUploadMessage(`Error uploading file: ${error.message}`);
            setUploadMessageType('error');
            console.error('File upload error:', error);
        } finally {
            setUploading(false);
            e.target.value = null; // Clear the input value after upload attempt
        }
    };

    return (
        <div className="mb-4">
            {isBuilder ? (
                // Builder Mode: Allows specifying allowed file types
                <div className="p-4 border rounded bg-white">
                    <h4 className="text-lg font-semibold mb-2">File Upload Options</h4>
                    <p className="text-gray-600 text-sm mb-2">
                        This question allows respondents to upload a file.
                        You can specify allowed file types (e.g., ".pdf,.jpg,.mp4", or "image/*,application/pdf").
                    </p>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Allowed File Types:</label>
                        <input
                            type="text"
                            value={question.allowedFileTypes || ''}
                            onChange={(e) => updateQuestion('allowedFileTypes', e.target.value)}
                            placeholder=".pdf, .docx, .xlsx, image/*, audio/*, video/*"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        />
                    </div>
                </div>
            ) : (
                // Respondent Mode: Allows uploading a file
                <div className="space-y-3">
                    <label className="block text-gray-800 text-lg font-semibold mb-4">{question.questionText}</label>
                    <input
                        type="file"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        // Use 'accept' attribute based on allowedFileTypes for browser-level filtering
                        accept={question.allowedFileTypes || '*/*'}
                        className="block w-full text-sm text-gray-500
                                   file:mr-4 file:py-2 file:px-4
                                   file:rounded-full file:border-0
                                   file:text-sm file:font-semibold
                                   file:bg-blue-50 file:text-blue-700
                                   hover:file:bg-blue-100"
                    />
                    {uploading && (
                        <p className="text-blue-600 text-sm mt-2">Uploading...</p>
                    )}
                    {uploadMessage && (
                        <p className={`text-sm mt-2 ${uploadMessageType === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                            {uploadMessage}
                        </p>
                    )}
                    {answer && uploadMessageType === 'success' && (
                        <p className="text-gray-600 text-sm mt-2">
                            Uploaded: <a href={answer} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View File</a>
                        </p>
                    )}
                    {!selectedFile && !answer && !uploading && (
                        <p className="text-gray-500 text-sm mt-2">No file selected.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default FileUpload;
