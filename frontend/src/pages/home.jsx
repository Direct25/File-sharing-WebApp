import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import '../App.css';
import axios from 'axios';
import DonationButton from './DonationButton.jsx';
import { v4 as uuidv4 } from 'uuid';
import { getSignedUrls } from '../service/api.js'; // Import the API function

const Home = () => {
    // 🚀 RESTORED LIMIT: 100MB via Chunking
    const MAX_FILE_SIZE = 100 * 1024 * 1024;
    const CHUNK_SIZE = 6 * 1024 * 1024; // 6MB chunks

    // --- 1. THEME FIX: Initialize state by reading LocalStorage FIRST ---
    // This prevents the theme from resetting to "Light" on refresh
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    const [files, setFiles] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [progress, setProgress] = useState({});
    const [error, setError] = useState('');
    const [isBackendWaking, setIsBackendWaking] = useState(false);
    const [showDonationPrompt, setShowDonationPrompt] = useState(false);
    const fileInputRef = useRef(null);

    // --- 2. Theme Effect: Apply classes whenever state changes ---
    useLayoutEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    // --- 3. Wake Up Backend ---
    const wakeUpBackend = async () => {
        setIsBackendWaking(true);
        try {
            // ⚠️ DEPLOYMENT URL: Change this to your Render URL for production
            await axios.get('https://file-sharing-backend-trry.onrender.com');
            alert('✅ Backend is awake!');
        } catch (error) {
            alert('⏳ Backend is starting up. Please wait 30 seconds.');
        } finally {
            setIsBackendWaking(false);
        }
    };

    // --- 3. Handle File Selection (With Auto-Clear) ---
    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        const oversizedFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE);

        if (oversizedFiles.length > 0) {
            setError("Files must be under 100MB.");
            return;
        }

        // ✨ AUTO-CLEAR LOGIC:
        // When new files are selected, clear previous uploads, progress, and errors
        setUploadedFiles([]);
        setProgress({});
        setShowDonationPrompt(false);
        setError('');
        
        setFiles(selectedFiles);
    };

    // --- 4. Large File Logic (Chunking) ---
    const uploadLargeFile = async (file, authData) => {
        const uniqueUploadId = uuidv4();
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        let start = 0;
        let end = Math.min(CHUNK_SIZE, file.size);

        // Use /auto/upload so Cloudinary sorts Video vs Raw automatically
        const uploadUrl = `https://api.cloudinary.com/v1_1/${authData.cloudName}/auto/upload`;
        let finalUrl = '';

        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            const chunk = file.slice(start, end);
            const formData = new FormData();

            formData.append('file', chunk);
            formData.append('api_key', authData.apiKey);
            formData.append('timestamp', authData.timestamp);
            formData.append('signature', authData.signature);
            formData.append('cloud_name', authData.cloudName);
            formData.append('resource_type', 'auto'); // Crucial for auto-detection

            const headers = {
                'X-Unique-Upload-Id': uniqueUploadId,
                'Content-Range': `bytes ${start}-${end - 1}/${file.size}`
            };

            try {
                const response = await axios.post(uploadUrl, formData, {
                    headers: headers,
                    onUploadProgress: (event) => {
                        if (event.loaded) {
                            const totalLoaded = start + event.loaded;
                            const pct = Math.round((totalLoaded / file.size) * 100);
                            setProgress(prev => ({ ...prev, [file.name]: pct }));
                        }
                    }
                });

                if (chunkIndex === totalChunks - 1) {
                    finalUrl = response.data.secure_url;
                }
                start = end;
                end = Math.min(start + CHUNK_SIZE, file.size);

            } catch (err) {
                console.error(`Chunk upload failed: ${err}`);
                throw err;
            }
        }
        return finalUrl;
    };

    // --- 5. Main Upload Logic ---
    const handleUpload = async () => {
        if (files.length === 0) {
            alert('Please select files to upload!');
            return;
        }

        setIsBackendWaking(true);

        try {
            console.log('🚀 Getting Signature...');
            // Gets signature from your backend (Render/Localhost via api.js)
            const authData = await getSignedUrls();

            if (!authData.signature) throw new Error("Failed to get signature");

            console.log('✅ Got Signature. Starting uploads...');

            const uploadPromises = files.map(async (file) => {
                // STRATEGY: Small files (<10MB) vs Large files (>10MB)
                if (file.size < 10 * 1024 * 1024) {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('api_key', authData.apiKey);
                    formData.append('timestamp', authData.timestamp);
                    formData.append('signature', authData.signature);
                    
                    // Use /auto/upload for small files too
                    const res = await axios.post(
                        `https://api.cloudinary.com/v1_1/${authData.cloudName}/auto/upload`,
                        formData,
                        {
                            onUploadProgress: (e) => {
                                const pct = Math.round((e.loaded / e.total) * 100);
                                setProgress(prev => ({ ...prev, [file.name]: pct }));
                            }
                        }
                    );
                    return { name: file.name, link: res.data.secure_url };
                } else {
                    console.log(`📦 File ${file.name} is >10MB. Using Chunked Upload.`);
                    const link = await uploadLargeFile(file, authData);
                    return { name: file.name, link: link };
                }
            });

            const uploaded = await Promise.all(uploadPromises);
            setUploadedFiles(uploaded);
            setShowDonationPrompt(true);
            alert('🎉 Files uploaded successfully!');
            setFiles([]); // Clear input
            setProgress({}); // Clear progress bars

        } catch (error) {
            console.error('Upload error:', error);
            alert(`❌ Upload failed: ${error.message || 'Unknown error'}`);
        } finally {
            setIsBackendWaking(false);
        }
    };

    // --- 6. The UI (Restored to the "Clean" version) ---
    return (
        <div className="container">
            {/* Theme Toggle Button */}
            <button
                onClick={toggleTheme}
                className="theme-toggle"
                aria-label="Toggle theme"
                title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
                {isDarkMode ? '☀️' : '🌙'}
            </button>

            <h1 className="title">📁 FileTransferHub</h1>
            <p className="subtitle">
                Effortlessly upload and share files with a simple and elegant interface.
            </p>

            {/* Backend Status Section */}
            <div className="backend-status">
                <p style={{
                    fontSize: '14px',
                    color: isDarkMode ? '#888' : '#666',
                    marginBottom: '15px',
                    fontStyle: 'italic'
                }}>
                    💡 <strong>Free Tier Notice:</strong> Backend may need 30-60 seconds to wake up
                </p>

                <button
                    onClick={wakeUpBackend}
                    disabled={isBackendWaking}
                    className="button"
                    style={{
                        backgroundColor: isBackendWaking ? '#666' : '#4CAF50',
                        marginBottom: '20px',
                        fontSize: '14px',
                        padding: '8px 16px'
                    }}
                >
                    {isBackendWaking ? '⏳ Waking up backend...' : '☕ Wake Up Backend First'}
                </button>
            </div>

            <div className="steps">
                <div className="step">
                    <span className="step-number">1</span>
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="button"
                    >
                        Select files to upload
                    </button>
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                    />
                </div>

                <div className="step">
                    <span className="step-number">2</span>
                    <span>Monitor upload progress:</span>
                    <ul className="file-list">
                        {files.map((file, index) => (
                            <li key={index} className="file-item">
                                <span>{file.name}</span>
                                <div className="progress-container">
                                    <div
                                        className="progress-bar"
                                        style={{ width: `${progress[file.name] || 0}%` }}
                                    ></div>
                                </div>
                                <span className="progress-text">
                                    {progress[file.name] ? `${progress[file.name]}%` : '0%'}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="step">
                    <span className="step-number">3</span>
                    <span>Your uploaded files will be available at:</span>
                    
                    {/* Disclaimer about file expiration */}
                    {uploadedFiles.length > 0 && (
                        <p style={{fontSize: '12px', color: '#888', fontStyle: 'italic', marginTop:'5px'}}>
                           (Note: Files are hosted on free Cloudinary tier)
                        </p>
                    )}

                    {uploadedFiles.length > 0 && (
                        <ul className="file-links">
                            {uploadedFiles.map((file, index) => (
                                <li key={index}>
                                    <a
                                        href={file.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="link"
                                    >
                                        {file.link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {error && <p className="error">{error}</p>}

            <button
                onClick={handleUpload}
                disabled={files.length === 0 || isBackendWaking}
                className={`button ${files.length === 0 || isBackendWaking ? 'disabled-button' : ''}`}
                style={{
                    backgroundColor: isBackendWaking ? '#666' : undefined,
                    cursor: isBackendWaking ? 'wait' : undefined
                }}
            >
                {isBackendWaking ? '⏳ Processing...' : 'Upload Files'}
            </button>

            <div className="uploaded-section">
                <h2>Uploaded Files History</h2>
                <ul className="uploaded-list">
                    {uploadedFiles.map((file, index) => (
                        <li key={index} className="uploaded-item">
                            <a
                                href={file.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link"
                            >
                                {file.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Donation prompt - shows after successful upload */}
            {showDonationPrompt && uploadedFiles.length > 0 && (
                <div className="success-donation-prompt" style={{
                    marginTop: '20px',
                    padding: '20px',
                    background: isDarkMode
                        ? 'linear-gradient(135deg, #1a4d3a 0%, #0f2d1f 100%)'
                        : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    borderRadius: '12px',
                    border: isDarkMode ? '2px solid #22c55e' : '2px solid #16a34a',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ marginBottom: '15px' }}>
                        <span style={{ fontSize: '32px' }}>🎉</span>
                        <h3 style={{
                            color: isDarkMode ? '#22c55e' : '#15803d',
                            margin: '8px 0',
                            fontSize: '18px',
                            fontWeight: 'bold'
                        }}>
                            Upload Complete!
                        </h3>
                        <p style={{
                            color: isDarkMode ? '#86efac' : '#16a34a',
                            margin: '0 0 15px 0',
                            fontSize: '14px'
                        }}>
                            {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} ready to share ✨
                        </p>
                    </div>

                    <DonationButton showMessage={true} />

                    <button
                        onClick={() => setShowDonationPrompt(false)}
                        style={{
                            marginTop: '10px',
                            background: 'none',
                            border: 'none',
                            color: isDarkMode ? '#86efac' : '#16a34a',
                            fontSize: '12px',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }}
                    >
                        Maybe later ✕
                    </button>
                </div>
            )}

        </div>
    );
};

export default Home;

// import { useRef, useState, useEffect } from 'react';
// import '../App.css';
// import axios from 'axios';
// import DonationButton from './DonationButton.jsx';
// import { v4 as uuidv4 } from 'uuid';
// import { getSignedUrls } from '../service/api.js'; // Import the API function

// const Home = () => {
//     // 🚀 RESTORED LIMIT: 100MB via Chunking
//     const MAX_FILE_SIZE = 100 * 1024 * 1024;
//     const CHUNK_SIZE = 6 * 1024 * 1024; // 6MB chunks

//     // --- 1. THEME FIX: Initialize state by reading LocalStorage FIRST ---
//     // This prevents the theme from resetting to "Light" on refresh
//     const [isDarkMode, setIsDarkMode] = useState(() => {
//         const savedTheme = localStorage.getItem('theme');
//         if (savedTheme) {
//             return savedTheme === 'dark';
//         }
//         return window.matchMedia('(prefers-color-scheme: dark)').matches;
//     });

//     const [files, setFiles] = useState([]);
//     const [uploadedFiles, setUploadedFiles] = useState([]);
//     const [progress, setProgress] = useState({});
//     const [error, setError] = useState('');
//     const [isBackendWaking, setIsBackendWaking] = useState(false);
//     const [showDonationPrompt, setShowDonationPrompt] = useState(false);
//     const fileInputRef = useRef(null);

//     // --- 2. Theme Effect: Apply classes whenever state changes ---
//     useEffect(() => {
//         if (isDarkMode) {
//             document.body.classList.add('dark-theme');
//             document.body.classList.remove('light-theme');
//             localStorage.setItem('theme', 'dark');
//         } else {
//             document.body.classList.add('light-theme');
//             document.body.classList.remove('dark-theme');
//             localStorage.setItem('theme', 'light');
//         }
//     }, [isDarkMode]);

//     const toggleTheme = () => setIsDarkMode(!isDarkMode);

//     // --- 3. Wake Up Backend ---
//     const wakeUpBackend = async () => {
//         setIsBackendWaking(true);
//         try {
//             // ⚠️ DEPLOYMENT: Use your Render URL here
//             await axios.get('http://localhost:3001');
//             alert('✅ Backend is awake!');
//         } catch (error) {
//             alert('⏳ Backend is starting up. Please wait 30 seconds.');
//         } finally {
//             setIsBackendWaking(false);
//         }
//     };

//     // --- 4. Handle File Selection (With Auto-Clear) ---
//     const handleFileChange = (event) => {
//         const selectedFiles = Array.from(event.target.files);
//         const oversizedFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE);

//         if (oversizedFiles.length > 0) {
//             setError("Files must be under 100MB.");
//             return;
//         }

//         // ✨ AUTO-CLEAR: Clears old results when you pick new files
//         setUploadedFiles([]);
//         setProgress({});
//         setShowDonationPrompt(false);
//         setError('');
        
//         setFiles(selectedFiles);
//     };

//     // --- 5. Large File Logic (Chunking) ---
//     const uploadLargeFile = async (file, authData) => {
//         const uniqueUploadId = uuidv4();
//         const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
//         let start = 0;
//         let end = Math.min(CHUNK_SIZE, file.size);

//         // Use /auto/upload so Cloudinary sorts Video vs Raw automatically
//         const uploadUrl = `https://api.cloudinary.com/v1_1/${authData.cloudName}/auto/upload`;
//         let finalUrl = '';

//         for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
//             const chunk = file.slice(start, end);
//             const formData = new FormData();

//             formData.append('file', chunk);
//             formData.append('api_key', authData.apiKey);
//             formData.append('timestamp', authData.timestamp);
//             formData.append('signature', authData.signature);
//             formData.append('cloud_name', authData.cloudName);
//             formData.append('resource_type', 'auto'); 

//             const headers = {
//                 'X-Unique-Upload-Id': uniqueUploadId,
//                 'Content-Range': `bytes ${start}-${end - 1}/${file.size}`
//             };

//             try {
//                 const response = await axios.post(uploadUrl, formData, {
//                     headers: headers,
//                     onUploadProgress: (event) => {
//                         if (event.loaded) {
//                             const totalLoaded = start + event.loaded;
//                             const pct = Math.round((totalLoaded / file.size) * 100);
//                             setProgress(prev => ({ ...prev, [file.name]: pct }));
//                         }
//                     }
//                 });

//                 if (chunkIndex === totalChunks - 1) {
//                     finalUrl = response.data.secure_url;
//                 }
//                 start = end;
//                 end = Math.min(start + CHUNK_SIZE, file.size);

//             } catch (err) {
//                 console.error(`Chunk upload failed: ${err}`);
//                 throw err;
//             }
//         }
//         return finalUrl;
//     };

//     // --- 6. Main Upload Logic ---
//     const handleUpload = async () => {
//         if (files.length === 0) {
//             alert('Please select files to upload!');
//             return;
//         }

//         setIsBackendWaking(true);

//         try {
//             console.log('🚀 Getting Signature...');
//             const authData = await getSignedUrls();

//             if (!authData.signature) throw new Error("Failed to get signature");

//             console.log('✅ Got Signature. Starting uploads...');

//             const uploadPromises = files.map(async (file) => {
//                 if (file.size < 10 * 1024 * 1024) {
//                     // Small File Strategy
//                     const formData = new FormData();
//                     formData.append('file', file);
//                     formData.append('api_key', authData.apiKey);
//                     formData.append('timestamp', authData.timestamp);
//                     formData.append('signature', authData.signature);
                    
//                     const res = await axios.post(
//                         `https://api.cloudinary.com/v1_1/${authData.cloudName}/auto/upload`,
//                         formData,
//                         {
//                             onUploadProgress: (e) => {
//                                 const pct = Math.round((e.loaded / e.total) * 100);
//                                 setProgress(prev => ({ ...prev, [file.name]: pct }));
//                             }
//                         }
//                     );
//                     return { name: file.name, link: res.data.secure_url };
//                 } else {
//                     // Large File Strategy
//                     console.log(`📦 File ${file.name} is >10MB. Using Chunked Upload.`);
//                     const link = await uploadLargeFile(file, authData);
//                     return { name: file.name, link: link };
//                 }
//             });

//             const uploaded = await Promise.all(uploadPromises);
//             setUploadedFiles(uploaded);
//             setShowDonationPrompt(true);
//             setFiles([]); // Clear input so user can start over

//         } catch (error) {
//             console.error('Upload error:', error);
//             alert(`❌ Upload failed: ${error.message || 'Unknown error'}`);
//         } finally {
//             setIsBackendWaking(false);
//         }
//     };

//     // --- 7. The UI ---
//     return (
//         <div className="container">
//             {/* Theme Toggle Button */}
//             <button
//                 onClick={toggleTheme}
//                 className="theme-toggle"
//                 aria-label="Toggle theme"
//                 title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
//             >
//                 {isDarkMode ? '☀️' : '🌙'}
//             </button>

//             <h1 className="title">📁 FileTransferHub</h1>
//             <p className="subtitle">
//                 Effortlessly upload and share files with a simple and elegant interface.
//             </p>

//             {/* Backend Status Section */}
//             <div className="backend-status">
//                 <p style={{
//                     fontSize: '14px',
//                     color: isDarkMode ? '#888' : '#666',
//                     marginBottom: '15px',
//                     fontStyle: 'italic'
//                 }}>
//                     💡 <strong>Free Tier Notice:</strong> Backend may need 30-60 seconds to wake up
//                 </p>

//                 <button
//                     onClick={wakeUpBackend}
//                     disabled={isBackendWaking}
//                     className="button"
//                     style={{
//                         backgroundColor: isBackendWaking ? '#666' : '#4CAF50',
//                         marginBottom: '20px',
//                         fontSize: '14px',
//                         padding: '8px 16px'
//                     }}
//                 >
//                     {isBackendWaking ? '⏳ Waking up backend...' : '☕ Wake Up Backend First'}
//                 </button>
//             </div>

//             <div className="steps">
//                 <div className="step">
//                     <span className="step-number">1</span>
//                     <button
//                         onClick={() => fileInputRef.current.click()}
//                         className="button"
//                     >
//                         Select files to upload
//                     </button>
//                     <input
//                         type="file"
//                         multiple
//                         onChange={handleFileChange}
//                         style={{ display: 'none' }}
//                         ref={fileInputRef}
//                     />
//                 </div>

//                 <div className="step">
//                     <span className="step-number">2</span>
//                     <span>Monitor upload progress:</span>
//                     <ul className="file-list">
//                         {files.map((file, index) => (
//                             <li key={index} className="file-item">
//                                 <span>{file.name}</span>
//                                 <div className="progress-container">
//                                     <div
//                                         className="progress-bar"
//                                         style={{ width: `${progress[file.name] || 0}%` }}
//                                     ></div>
//                                 </div>
//                                 <span className="progress-text">
//                                     {progress[file.name] ? `${progress[file.name]}%` : '0%'}
//                                 </span>
//                             </li>
//                         ))}
//                     </ul>
//                 </div>

//                 <div className="step">
//                     <span className="step-number">3</span>
//                     <span>Your uploaded files will be available at:</span>
                    
//                     {/* Disclaimer about file expiration */}
//                     {uploadedFiles.length > 0 && (
//                         <p style={{fontSize: '12px', color: '#888', fontStyle: 'italic', marginTop:'5px'}}>
//                            (Files automatically removed after 6 days)
//                         </p>
//                     )}

//                     {uploadedFiles.length > 0 && (
//                         <ul className="file-links">
//                             {uploadedFiles.map((file, index) => (
//                                 <li key={index}>
//                                     <a
//                                         href={file.link}
//                                         target="_blank"
//                                         rel="noopener noreferrer"
//                                         className="link"
//                                     >
//                                         {file.link}
//                                     </a>
//                                 </li>
//                             ))}
//                         </ul>
//                     )}
//                 </div>
//             </div>

//             {error && <p className="error">{error}</p>}

//             <button
//                 onClick={handleUpload}
//                 disabled={files.length === 0 || isBackendWaking}
//                 className={`button ${files.length === 0 || isBackendWaking ? 'disabled-button' : ''}`}
//                 style={{
//                     backgroundColor: isBackendWaking ? '#666' : undefined,
//                     cursor: isBackendWaking ? 'wait' : undefined
//                 }}
//             >
//                 {isBackendWaking ? '⏳ Processing...' : 'Upload Files'}
//             </button>

//             <div className="uploaded-section">
//                 <h2>Uploaded Files History</h2>
//                 <ul className="uploaded-list">
//                     {uploadedFiles.map((file, index) => (
//                         <li key={index} className="uploaded-item">
//                             <a
//                                 href={file.link}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="link"
//                             >
//                                 {file.name}
//                             </a>
//                         </li>
//                     ))}
//                 </ul>
//             </div>

//             {/* Donation prompt - shows after successful upload */}
//             {showDonationPrompt && uploadedFiles.length > 0 && (
//                 <div className="success-donation-prompt" style={{
//                     marginTop: '20px',
//                     padding: '20px',
//                     background: isDarkMode
//                         ? 'linear-gradient(135deg, #1a4d3a 0%, #0f2d1f 100%)'
//                         : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
//                     borderRadius: '12px',
//                     border: isDarkMode ? '2px solid #22c55e' : '2px solid #16a34a',
//                     textAlign: 'center',
//                     boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
//                 }}>
//                     <div style={{ marginBottom: '15px' }}>
//                         <span style={{ fontSize: '32px' }}>🎉</span>
//                         <h3 style={{
//                             color: isDarkMode ? '#22c55e' : '#15803d',
//                             margin: '8px 0',
//                             fontSize: '18px',
//                             fontWeight: 'bold'
//                         }}>
//                             Upload Complete!
//                         </h3>
//                         <p style={{
//                             color: isDarkMode ? '#86efac' : '#16a34a',
//                             margin: '0 0 15px 0',
//                             fontSize: '14px'
//                         }}>
//                             {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} ready to share ✨
//                         </p>
//                     </div>

//                     <DonationButton showMessage={true} />

//                     <button
//                         onClick={() => setShowDonationPrompt(false)}
//                         style={{
//                             marginTop: '10px',
//                             background: 'none',
//                             border: 'none',
//                             color: isDarkMode ? '#86efac' : '#16a34a',
//                             fontSize: '12px',
//                             cursor: 'pointer',
//                             textDecoration: 'underline'
//                         }}
//                     >
//                         Maybe later ✕
//                     </button>
//                 </div>
//             )}

//         </div>
//     );
// };

// export default Home;