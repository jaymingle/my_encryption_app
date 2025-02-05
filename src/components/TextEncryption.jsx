import React, { useState, useEffect } from 'react';

const TextEncryption = () => {
    const [inputText, setInputText] = useState('');
    const [encryptedText, setEncryptedText] = useState('');
    const [decryptInput, setDecryptInput] = useState('');
    const [decryptedText, setDecryptedText] = useState('');
    const [level, setLevel] = useState(1);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Clear toast after timeout
    useEffect(() => {
        let timeoutId;
        if (toast.show) {
            timeoutId = setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' });
            }, 2000);
        }
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [toast.show]);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    const encryptText = () => {
        if (!inputText) {
            showToast('Please enter text to encrypt', 'error');
            return;
        }

        const encrypted = inputText.split('').map(char => {
            if (!/[a-zA-Z]/.test(char)) return char;

            const isUpperCase = char === char.toUpperCase();
            const baseChar = char.toLowerCase();
            const baseCode = baseChar.charCodeAt(0);
            let newCode;

            switch (level) {
                case 1:
                    newCode = ((baseCode - 97 - 1 + 26) % 26) + 97;
                    break;
                case 2:
                    newCode = ((baseCode - 97 + 1) % 26) + 97;
                    break;
                case 3:
                    newCode = ((baseCode - 97 + 2) % 26) + 97;
                    break;
                default:
                    newCode = baseCode;
            }

            const newChar = String.fromCharCode(newCode);
            return isUpperCase ? newChar.toUpperCase() : newChar;
        }).join('');

        setEncryptedText(`[L${level}]${encrypted}`);
        showToast('Text encrypted successfully!');
    };

    // Replace the existing decryptText function with this one
    const decryptText = () => {
        if (!decryptInput) {
            showToast('Please enter text to decrypt', 'error');
            return;
        }

        const match = decryptInput.match(/^\s*\[L([123])\](.*)/s);
        if (!match) {
            showToast('Invalid encrypted text format', 'error');
            return;
        }

        const level = parseInt(match[1]);
        const text = match[2];

        try {
            const decrypted = text.split('').map(char => {
                // Preserve all whitespace characters
                if (!/[a-zA-Z]/.test(char)) {
                    return char;
                }

                const isUpper = char === char.toUpperCase();
                const base = char.toLowerCase();
                const code = base.charCodeAt(0) - 97;

                let shift;
                switch (level) {
                    case 1: shift = 1; break;
                    case 2: shift = 25; break; // -1 is same as +25 in mod 26
                    case 3: shift = 24; break; // -2 is same as +24 in mod 26
                    default: shift = 0;
                }

                let newCode = ((code + shift) % 26) + 97;
                let newChar = String.fromCharCode(newCode);
                return isUpper ? newChar.toUpperCase() : newChar;
            }).join('');

            setDecryptedText(decrypted);
            showToast('Text decrypted successfully!', 'success');
        } catch (error) {
            showToast('Error during decryption', error);
        }
    };

    const copyToClipboard = (text, type) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast(`${type} text copied to clipboard!`);
        } catch (err) {
            document.body.removeChild(textarea);
            showToast('Failed to copy text', 'error');
        }
    };

    const resetAll = () => {
        if (window.confirm('Are you sure you want to reset all fields?')) {
            setInputText('');
            setEncryptedText('');
            setDecryptInput('');
            setDecryptedText('');
            setLevel(1);
            showToast('All fields have been reset', 'success');
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-8">
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">Text Encryption</h2>

                {/* Toast Notification */}
                {toast.show && (
                    <div
                        className={`fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg transition-opacity duration-300 ${
                            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                        } text-white`}
                        style={{ zIndex: 1000 }}
                    >
                        {toast.message}
                    </div>
                )}

                {/* Encryption Section */}
                <div className="space-y-4">
          <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to encrypt..."
              className="w-full h-32 p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
          />

                    <div className="flex gap-4">
                        <select
                            value={level}
                            onChange={(e) => setLevel(parseInt(e.target.value))}
                            className="p-2 border rounded-md"
                        >
                            <option value={1}>Level 1</option>
                            <option value={2}>Level 2</option>
                            <option value={3}>Level 3</option>
                        </select>

                        <button
                            onClick={encryptText}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                            Encrypt
                        </button>
                    </div>

                    <div className="relative">
            <textarea
                value={encryptedText}
                readOnly
                placeholder="Encrypted text will appear here..."
                className="w-full h-32 p-3 border rounded-md bg-gray-50"
            />
                        {encryptedText && (
                            <button
                                onClick={() => copyToClipboard(encryptedText, 'Encrypted')}
                                className="absolute top-2 right-2 px-3 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300 transition-colors"
                            >
                                Copy
                            </button>
                        )}
                    </div>
                </div>

                {/* Decryption Section */}
                <div className="mt-8 pt-8 border-t space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800">Text Decryption</h2>

                    <textarea
                        value={decryptInput}
                        onChange={(e) => setDecryptInput(e.target.value)}
                        placeholder="Paste encrypted text here..."
                        className="w-full h-32 p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                        onClick={decryptText}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                        Decrypt
                    </button>

                    <div className="relative">
            <textarea
                value={decryptedText}
                readOnly
                placeholder="Decrypted text will appear here..."
                className="w-full h-32 p-3 border rounded-md bg-gray-50"
            />
                        {decryptedText && (
                            <button
                                onClick={() => copyToClipboard(decryptedText, 'Decrypted')}
                                className="absolute top-2 right-2 px-3 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300 transition-colors"
                            >
                                Copy
                            </button>
                        )}
                    </div>
                </div>

                {/* Reset Button Section */}
                <div className="mt-8 pt-8 border-t text-center">
                    <button
                        onClick={resetAll}
                        className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                        Reset All Fields
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TextEncryption;