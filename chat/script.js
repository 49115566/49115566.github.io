document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const optionsContainer = document.getElementById('options-container');
    const selectedOptionButton = document.getElementById('selected-option-button');
    const selectedOptionText = document.getElementById('selected-option-text');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');

    const urlParams = new URLSearchParams(window.location.search);
    const topic = urlParams.get('topic');

    let aiResponses = {};

    // Helper function to add a message to the chat container
    function addMessage(sender, content) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', sender);
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to bottom
        return messageDiv;
    }

    // Helper function to render structured message content (text, video, signup prompt)
    async function renderMessageContent(messageDiv, contentArray) {
        for (const item of contentArray) {
            if (item.type === 'text') {
                const words = item.content.split(' ');
                for (let i = 0; i < words.length; i++) {
                    messageDiv.textContent += words[i] + ' ';
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
            } else if (item.type === 'video') {
                const videoEmbed = document.createElement('iframe');
                videoEmbed.src = item.src;
                videoEmbed.title = item.alt;
                videoEmbed.frameBorder = "0";
                videoEmbed.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                videoEmbed.allowFullscreen = true;
                messageDiv.appendChild(videoEmbed);
            } else if (item.type === 'signup_prompt') {
                const promptDiv = document.createElement('div');
                promptDiv.classList.add('signup-prompt');
                promptDiv.innerHTML = `
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                    <a href="${item.link}" class="signup-button">${item.button_text}</a>
                `;
                messageDiv.appendChild(promptDiv);
            }
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    // Function to display option cards dynamically
    function displayOptionCards(optionsData) {
        optionsContainer.innerHTML = ''; // Clear existing options
        optionsData.forEach(optionData => {
            const optionCard = document.createElement('div');
            optionCard.classList.add('option-card');
            optionCard.dataset.option = optionData.dataOption;
            optionCard.innerHTML = `
                <p class="option-main-text">${optionData.mainText}</p>
                <p class="option-sub-text">${optionData.subText}</p>
            `;
            optionsContainer.appendChild(optionCard);

            optionCard.addEventListener('click', async () => {
                const option = optionData.dataOption;
                const userMessageText = optionData.mainText;

                // Display user's selected option
                selectedOptionText.textContent = userMessageText;
                selectedOptionButton.style.display = 'block';
                optionsContainer.style.display = 'none'; // Hide options after selection

                // Display AI response
                if (aiResponses[topic] && aiResponses[topic][option]) {
                    const aiMessageDiv = addMessage('ai', '');
                    await renderMessageContent(aiMessageDiv, aiResponses[topic][option]);
                }
            });
        });
    }

    // Handle chat input and send button
    sendButton.addEventListener('click', async () => {
        const message = chatInput.value.trim();
        if (message) {
            const userMessageDiv = addMessage('user', '');
            await renderMessageContent(userMessageDiv, [{ type: 'text', content: message }]);
            chatInput.value = '';
            // Here you would typically send the message to a backend and get a response
            // For this demo, we'll just acknowledge it.
            const aiMessageDiv = addMessage('ai', '');
            await renderMessageContent(aiMessageDiv, [{ type: 'text', content: "Thank you for your message. I'm still learning to respond to free-form input." }]);
        }
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });

    // Display loading message
    const loadingMessageDiv = addMessage('ai', '');
    renderMessageContent(loadingMessageDiv, [{ type: 'text', content: "Loading responses..." }]);

    fetch('responses.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            aiResponses = data;
            loadingMessageDiv.remove(); // Remove loading message

            // Dynamically load option cards
            if (aiResponses[topic] && aiResponses[topic].options) {
                displayOptionCards(aiResponses[topic].options);
            }

            // Initial AI message
            if (aiResponses[topic] && aiResponses[topic].initial) {
                const aiMessageDiv = addMessage('ai', '');
                renderMessageContent(aiMessageDiv, aiResponses[topic].initial);
            }
        })
        .catch(error => {
            console.error('Error loading AI responses:', error);
            loadingMessageDiv.remove(); // Remove loading message
            const errorMessageDiv = addMessage('ai', '');
            renderMessageContent(errorMessageDiv, [{ type: 'text', content: "Sorry, I'm having trouble loading my responses right now. Please try again later." }]);
        });
});