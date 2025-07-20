
// import { useRef, useState, useEffect } from 'react';
// import '../App.css';
// import { getSignedUrls } from '../service/api.js';
// import DonationButton from './DonationButton.jsx';

// const Home = () => {
//     const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB in bytes
//     const [files, setFiles] = useState([]); // Stores selected files
//     const [uploadedFiles, setUploadedFiles] = useState([]); // Stores uploaded file info
//     const [progress, setProgress] = useState({}); // Tracks upload progress for each file
//     const [error, setError] = useState(''); // Stores error message
//     const [isDarkMode, setIsDarkMode] = useState(false); // Theme state
//     const [isBackendWaking, setIsBackendWaking] = useState(false); // Backend wake state
//     const fileInputRef = useRef(null); // Ref for hidden file input

//     // Load theme preference from localStorage on component mount
//     useEffect(() => {
//         console.log('🔍 Loading theme preference...');
        
//         try {
//             const savedTheme = localStorage.getItem('theme');
//             console.log('🔍 Saved theme from localStorage:', savedTheme);
            
//             if (savedTheme) {
//                 const isDark = savedTheme === 'dark';
//                 console.log('🔍 Setting isDarkMode to:', isDark);
//                 setIsDarkMode(isDark);
//             } else {
//                 // Check system preference
//                 const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
//                 console.log('🔍 System prefers dark mode:', prefersDark);
//                 setIsDarkMode(prefersDark);
//             }
//         } catch (error) {
//             console.error('🚨 Error accessing localStorage:', error);
//             // Fallback to system preference
//             const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
//             setIsDarkMode(prefersDark);
//         }
//     }, []);

//     // Apply theme to document body and save preference
//     useEffect(() => {
//         console.log('🔍 Applying theme. isDarkMode:', isDarkMode);
        
//         try {
//             if (isDarkMode) {
//                 document.body.classList.add('dark-theme');
//                 document.body.classList.remove('light-theme');
//                 localStorage.setItem('theme', 'dark');
//                 console.log('🔍 Applied dark theme and saved to localStorage');
//             } else {
//                 document.body.classList.add('light-theme');
//                 document.body.classList.remove('dark-theme');
//                 localStorage.setItem('theme', 'light');
//                 console.log('🔍 Applied light theme and saved to localStorage');
//             }
//         } catch (error) {
//             console.error('🚨 Error saving theme to localStorage:', error);
//             // Still apply the theme even if saving fails
//             if (isDarkMode) {
//                 document.body.classList.add('dark-theme');
//                 document.body.classList.remove('light-theme');
//             } else {
//                 document.body.classList.add('light-theme');
//                 document.body.classList.remove('dark-theme');
//             }
//         }
//     }, [isDarkMode]);

//     const toggleTheme = () => {
//         console.log('🔍 Toggling theme. Current isDarkMode:', isDarkMode);
//         setIsDarkMode(!isDarkMode);
//     };

//     // Function to wake up backend
//     const wakeUpBackend = async () => {
//         setIsBackendWaking(true);
//         try {
//             const response = await fetch('https://file-sharing-backend-trry.onrender.com', {
//                 method: 'GET',
//                 mode: 'cors'
//             });
            
//             if (response.ok) {
//                 alert('✅ Backend is awake! You can now upload files safely.');
//             } else {
//                 alert('⏳ Backend is starting up. Please wait a moment and try uploading.');
//             }
//         } catch (error) {
//             console.log('Backend is still starting...', error);
//             alert('⏳ Backend is starting up. This may take up to 60 seconds on free tier.');
//         } finally {
//             setIsBackendWaking(false);
//         }
//     };

//     // Enhanced API call with retry logic
//     const getSignedUrlsWithRetry = async (fileArray, maxRetries = 3) => {
//         for (let i = 0; i < maxRetries; i++) {
//             try {
//                 console.log(`🔄 API attempt ${i + 1}/${maxRetries}`);
//                 return await getSignedUrls(fileArray);
//             } catch (error) {
//                 console.log(`❌ Attempt ${i + 1} failed:`, error.message);
                
//                 if (i === maxRetries - 1) {
//                     // Last attempt failed
//                     throw new Error(`Backend may be starting up. Please wait 30-60 seconds and try again, or click "Wake Up Backend" first.`);
//                 }
                
//                 // Wait before retrying (progressively longer waits)
//                 const waitTime = (i + 1) * 10000; // 10s, 20s, 30s
//                 console.log(`⏳ Waiting ${waitTime/1000}s before retry...`);
//                 await new Promise(resolve => setTimeout(resolve, waitTime));
//             }
//         }
//     };

//     const handleFileChange = (event) => {
//         const selectedFiles = Array.from(event.target.files);
//         const oversizedFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE);

//         if (oversizedFiles.length > 0) {
//             setError("Some files exceed the maximum size of 50 MB and cannot be uploaded.");
//             return;
//         }

//         setFiles(selectedFiles);
//         setError('');
//     };

//     const handleUpload = async () => {
//         if (files.length === 0) {
//             alert('Please select files to upload!');
//             return;
//         }

//         const fileArray = Array.from(files).map((file) => ({
//             fileName: file.name,
//             fileType: file.type,
//         }));

//         setIsBackendWaking(true); // Show loading state

//         try {
//             console.log('🚀 Starting upload process...');
            
//             // Use retry logic for cold starts
//             const signedUrls = await getSignedUrlsWithRetry(fileArray);

//             console.log('✅ Got signed URLs, starting file uploads...');

//             const uploaded = await Promise.all(
//                 signedUrls.map(({ signedUrl, objectUrl }, index) => {
//                     const file = files[index];

//                     return new Promise((resolve, reject) => {
//                         const xhr = new XMLHttpRequest();

//                         xhr.upload.addEventListener('progress', (event) => {
//                             if (event.lengthComputable) {
//                                 const percentage = Math.round((event.loaded / event.total) * 100);
//                                 setProgress((prev) => ({
//                                     ...prev,
//                                     [file.name]: percentage,
//                                 }));
//                             }
//                         });

//                         xhr.open('PUT', signedUrl);
//                         xhr.setRequestHeader('Content-Type', file.type);

//                         xhr.onload = () => {
//                             if (xhr.status === 200) {
//                                 resolve({ name: file.name, link: objectUrl });
//                             } else {
//                                 reject(new Error(`Failed to upload ${file.name}`));
//                             }
//                         };

//                         xhr.onerror = () => {
//                             reject(new Error(`Network error while uploading ${file.name}`));
//                         };

//                         xhr.send(file);
//                     });
//                 })
//             );

//             setUploadedFiles(uploaded);
//             alert('🎉 Files uploaded successfully!');
//             fileInputRef.current.value = '';
//             setFiles([]);
//             setProgress({});
//         } catch (error) {
//             console.error('Upload error:', error);
            
//             // User-friendly error messages
//             if (error.message.includes('Network Error') || error.message.includes('ERR_CONNECTION_REFUSED')) {
//                 alert('🔄 Backend is starting up (free tier). Please click "Wake Up Backend" first, wait 30-60 seconds, then try again.');
//             } else if (error.message.includes('Backend may be starting up')) {
//                 alert(error.message);
//             } else {
//                 alert('❌ Upload failed. Please try again or wake up the backend first.');
//             }
//         } finally {
//             setIsBackendWaking(false); // Hide loading state
//         }
//     };

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
//                  <h2>Uploaded Files</h2>
//                  <ul className="uploaded-list">
//                      {uploadedFiles.map((file, index) => (
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
//         </div>
//     );
// };

// export default Home;


import { useRef, useState, useEffect } from 'react';
import '../App.css';
import { getSignedUrls } from '../service/api.js';
import DonationButton from './DonationButton.jsx';

const Home = () => {
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB in bytes
    const [files, setFiles] = useState([]); // Stores selected files
    const [uploadedFiles, setUploadedFiles] = useState([]); // Stores uploaded file info
    const [progress, setProgress] = useState({}); // Tracks upload progress for each file
    const [error, setError] = useState(''); // Stores error message
    const [isDarkMode, setIsDarkMode] = useState(false); // Theme state
    const [isBackendWaking, setIsBackendWaking] = useState(false); // Backend wake state
    const [showDonationPrompt, setShowDonationPrompt] = useState(false); // Show donation after success
    const fileInputRef = useRef(null); // Ref for hidden file input

    // Load theme preference from localStorage on component mount
    useEffect(() => {
        console.log('🔍 Loading theme preference...');
        
        try {
            const savedTheme = localStorage.getItem('theme');
            console.log('🔍 Saved theme from localStorage:', savedTheme);
            
            if (savedTheme) {
                const isDark = savedTheme === 'dark';
                console.log('🔍 Setting isDarkMode to:', isDark);
                setIsDarkMode(isDark);
            } else {
                // Check system preference
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                console.log('🔍 System prefers dark mode:', prefersDark);
                setIsDarkMode(prefersDark);
            }
        } catch (error) {
            console.error('🚨 Error accessing localStorage:', error);
            // Fallback to system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDarkMode(prefersDark);
        }
    }, []);

    // Apply theme to document body and save preference
    useEffect(() => {
        console.log('🔍 Applying theme. isDarkMode:', isDarkMode);
        
        try {
            if (isDarkMode) {
                document.body.classList.add('dark-theme');
                document.body.classList.remove('light-theme');
                localStorage.setItem('theme', 'dark');
                console.log('🔍 Applied dark theme and saved to localStorage');
            } else {
                document.body.classList.add('light-theme');
                document.body.classList.remove('dark-theme');
                localStorage.setItem('theme', 'light');
                console.log('🔍 Applied light theme and saved to localStorage');
            }
        } catch (error) {
            console.error('🚨 Error saving theme to localStorage:', error);
            // Still apply the theme even if saving fails
            if (isDarkMode) {
                document.body.classList.add('dark-theme');
                document.body.classList.remove('light-theme');
            } else {
                document.body.classList.add('light-theme');
                document.body.classList.remove('dark-theme');
            }
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        console.log('🔍 Toggling theme. Current isDarkMode:', isDarkMode);
        setIsDarkMode(!isDarkMode);
    };

    // Function to wake up backend
    const wakeUpBackend = async () => {
        setIsBackendWaking(true);
        try {
            const response = await fetch('https://file-sharing-backend-trry.onrender.com', {
                method: 'GET',
                mode: 'cors'
            });
            
            if (response.ok) {
                alert('✅ Backend is awake! You can now upload files safely.');
            } else {
                alert('⏳ Backend is starting up. Please wait a moment and try uploading.');
            }
        } catch (error) {
            console.log('Backend is still starting...', error);
            alert('⏳ Backend is starting up. This may take up to 60 seconds on free tier.');
        } finally {
            setIsBackendWaking(false);
        }
    };

    // Enhanced API call with retry logic
    const getSignedUrlsWithRetry = async (fileArray, maxRetries = 3) => {
        for (let i = 0; i < maxRetries; i++) {
            try {
                console.log(`🔄 API attempt ${i + 1}/${maxRetries}`);
                return await getSignedUrls(fileArray);
            } catch (error) {
                console.log(`❌ Attempt ${i + 1} failed:`, error.message);
                
                if (i === maxRetries - 1) {
                    // Last attempt failed
                    throw new Error(`Backend may be starting up. Please wait 30-60 seconds and try again, or click "Wake Up Backend" first.`);
                }
                
                // Wait before retrying (progressively longer waits)
                const waitTime = (i + 1) * 10000; // 10s, 20s, 30s
                console.log(`⏳ Waiting ${waitTime/1000}s before retry...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    };

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        const oversizedFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE);

        if (oversizedFiles.length > 0) {
            setError("Some files exceed the maximum size of 50 MB and cannot be uploaded.");
            return;
        }

        setFiles(selectedFiles);
        setError('');
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            alert('Please select files to upload!');
            return;
        }

        const fileArray = Array.from(files).map((file) => ({
            fileName: file.name,
            fileType: file.type,
        }));

        setIsBackendWaking(true); // Show loading state

        try {
            console.log('🚀 Starting upload process...');
            
            // Use retry logic for cold starts
            const signedUrls = await getSignedUrlsWithRetry(fileArray);

            console.log('✅ Got signed URLs, starting file uploads...');

            const uploaded = await Promise.all(
                signedUrls.map(({ signedUrl, objectUrl }, index) => {
                    const file = files[index];

                    return new Promise((resolve, reject) => {
                        const xhr = new XMLHttpRequest();

                        xhr.upload.addEventListener('progress', (event) => {
                            if (event.lengthComputable) {
                                const percentage = Math.round((event.loaded / event.total) * 100);
                                setProgress((prev) => ({
                                    ...prev,
                                    [file.name]: percentage,
                                }));
                            }
                        });

                        xhr.open('PUT', signedUrl);
                        xhr.setRequestHeader('Content-Type', file.type);

                        xhr.onload = () => {
                            if (xhr.status === 200) {
                                resolve({ name: file.name, link: objectUrl });
                            } else {
                                reject(new Error(`Failed to upload ${file.name}`));
                            }
                        };

                        xhr.onerror = () => {
                            reject(new Error(`Network error while uploading ${file.name}`));
                        };

                        xhr.send(file);
                    });
                })
            );

            setUploadedFiles(uploaded);
            setShowDonationPrompt(true); // Show donation button after success
            alert('🎉 Files uploaded successfully!');
            fileInputRef.current.value = '';
            setFiles([]);
            setProgress({});

            // Optional: Auto-hide donation prompt after 45 seconds
            setTimeout(() => {
                setShowDonationPrompt(false);
            }, 45000);

        } catch (error) {
            console.error('Upload error:', error);
            
            // User-friendly error messages
            if (error.message.includes('Network Error') || error.message.includes('ERR_CONNECTION_REFUSED')) {
                alert('🔄 Backend is starting up (free tier). Please click "Wake Up Backend" first, wait 30-60 seconds, then try again.');
            } else if (error.message.includes('Backend may be starting up')) {
                alert(error.message);
            } else {
                alert('❌ Upload failed. Please try again or wake up the backend first.');
            }
        } finally {
            setIsBackendWaking(false); // Hide loading state
        }
    };

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
                 <h2>Uploaded Files</h2>
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