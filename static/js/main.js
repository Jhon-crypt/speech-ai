let isRecording = false;
let recordingInterval;

document.getElementById('recordButton').addEventListener('click', async () => {
    const button = document.getElementById('recordButton');
    const statusDiv = document.getElementById('recordingStatus');
    const userText = document.getElementById('userText');
    const aiResponse = document.getElementById('aiResponse');
    
    if (!isRecording) {
        // Start recording
        isRecording = true;
        button.textContent = 'Stop Recording';
        button.classList.remove('btn-primary');
        button.classList.add('btn-danger');
        statusDiv.textContent = 'Preparing microphone...';
        userText.textContent = '';
        aiResponse.textContent = '';
        
        try {
            await fetch('/start-recording', { method: 'POST' });
            
            // Add recording animation
            let dots = '';
            recordingInterval = setInterval(() => {
                dots = dots.length >= 3 ? '' : dots + '.';
                statusDiv.textContent = `Recording${dots}`;
            }, 500);
            
        } catch (error) {
            console.error('Error:', error);
            stopRecording();
            statusDiv.textContent = 'Error starting recording';
        }
    } else {
        // Stop recording
        statusDiv.textContent = 'Processing...';
        stopRecording();
        
        try {
            const response = await fetch('/stop-recording', {
                method: 'POST'
            });
            
            const data = await response.json();
            
            if (data.success) {
                userText.textContent = data.text;
                aiResponse.textContent = data.response;
                statusDiv.textContent = '';
            } else {
                userText.textContent = 'Error occurred';
                aiResponse.textContent = data.error || 'Unknown error occurred';
                statusDiv.textContent = data.error || 'Error processing audio';
                console.error('Error:', data.error);
            }
        } catch (error) {
            userText.textContent = 'Error occurred';
            aiResponse.textContent = error.message;
            statusDiv.textContent = 'Error processing audio';
            console.error('Error:', error);
        }
    }
});

function stopRecording() {
    isRecording = false;
    const button = document.getElementById('recordButton');
    
    button.textContent = 'Start Recording';
    button.classList.remove('btn-danger');
    button.classList.add('btn-primary');
    
    if (recordingInterval) {
        clearInterval(recordingInterval);
    }
}
