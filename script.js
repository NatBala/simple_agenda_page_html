document.addEventListener('DOMContentLoaded', () => {
    // In a real app, fetch from a URL: fetch('/path/to/data.json')
    fetch('data.json') // Assuming data.json is in the same directory
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Data loaded:", data); // For debugging
            populateAgenda(data);
        })
        .catch(error => {
            console.error("Error loading agenda data:", error);
            // Optionally display an error message to the user
            document.body.innerHTML = `<p style="color: red; padding: 2em;">Error loading agenda data. Please check console.</p>`;
        });
});

function populateAgenda(data) {
    // --- Populate Header ---
    setTextContent('#client-name', data.clientInfo.name);
    setTextContent('#client-address-1', data.clientInfo.addressLine1);
    setTextContent('#client-address-2', data.clientInfo.addressLine2); // Handles potential null/undefined
    setTextContent('#meeting-date', data.clientInfo.meetingDate);
    const internalUseNotice = document.getElementById('internal-use-notice');
    if (data.clientInfo.internalUseOnly && internalUseNotice) {
        internalUseNotice.textContent = "For Internal use only";
    } else if (internalUseNotice) {
        internalUseNotice.textContent = ""; // Clear if not applicable
    }
    const logoImg = document.getElementById('header-logo');
    if (logoImg && data.clientInfo.logoPath) {
        logoImg.src = data.clientInfo.logoPath;
        // You might want alt text dynamically too
    }


    // --- Populate Assets Section ---
    setTextContent('#data-main-heading', data.assetsSection.heading);
    setTextContent('#data-sub-heading', data.assetsSection.subHeading);
    setTextContent('#data-disclaimer', data.assetsSection.disclaimer);

    data.assetsSection.columns.forEach(columnData => {
        const columnContainer = document.getElementById(columnData.id);
        if (columnContainer) {
            columnContainer.innerHTML = ''; // Clear potential placeholders
            columnContainer.className = `data-column ${columnData.cssClass || ''}`; // Reset/set class

            // Add Title
            const title = document.createElement('h3');
            title.textContent = columnData.title;
            columnContainer.appendChild(title);

            // Add Items
            if (columnData.items && columnData.items.length > 0) {
                columnData.items.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'data-item';

                    const labelSpan = document.createElement('span');
                    labelSpan.textContent = item.label;
                    itemDiv.appendChild(labelSpan);

                    const valueSpan = document.createElement('span');
                    valueSpan.className = 'value';
                    valueSpan.textContent = item.value;
                    itemDiv.appendChild(valueSpan);

                    columnContainer.appendChild(itemDiv);

                    // Add Bar Chart if percentage is provided
                    if (item.barPercentage !== null && item.barPercentage !== undefined) {
                        const barContainer = document.createElement('div');
                        barContainer.className = `bar-chart-container ${item.barClass || ''}`;
                         // Add padding directly here to ensure it's applied
                        barContainer.style.paddingRight = '55px'; // Match CSS value
                        barContainer.style.boxSizing = 'border-box';


                        const bar = document.createElement('div');
                        bar.className = 'bar';
                        // CRITICAL: Set width from JSON
                        bar.style.width = `${item.barPercentage}%`;
                        barContainer.appendChild(bar);
                        columnContainer.appendChild(barContainer);
                    }
                });
            }
        } else {
            console.warn(`Column container not found for id: ${columnData.id}`);
        }
    });


    // --- Populate Topics Section ---
    const topicsContainer = document.getElementById('topics-list-container');
    if (topicsContainer) {
        topicsContainer.innerHTML = ''; // Clear existing
        data.discussionTopics.forEach((topic, index) => {
            const topicItemDiv = document.createElement('div');
            topicItemDiv.className = 'topic-item';

            const headerP = document.createElement('p');
            headerP.className = 'topic-header';
            // Create number span
            const numberSpan = document.createElement('span');
            numberSpan.className = 'topic-number';
            numberSpan.textContent = `${index + 1}.`;
            headerP.appendChild(numberSpan);
            // Add title text node
            headerP.appendChild(document.createTextNode(` ${topic.title}`)); // Add space after number

            topicItemDiv.appendChild(headerP);

            if (topic.points && topic.points.length > 0) {
                const ul = document.createElement('ul');
                topic.points.forEach(point => {
                    const li = document.createElement('li');
                    if (point.link) {
                        const a = document.createElement('a');
                        a.href = point.link;
                        a.textContent = 'learn more'; // Or use dynamic text if provided
                        li.appendChild(document.createTextNode(`${point.text} (`));
                        li.appendChild(a);
                        li.appendChild(document.createTextNode(`)`));
                    } else {
                        li.textContent = point.text;
                    }
                    ul.appendChild(li);
                });
                topicItemDiv.appendChild(ul);
            }
            topicsContainer.appendChild(topicItemDiv);
        });
    }

     // --- Populate Team Section ---
     const teamContainer = document.getElementById('team-grid-container');
     if (teamContainer) {
         teamContainer.innerHTML = ''; // Clear
         data.team.forEach(member => {
             const memberDiv = document.createElement('div');
             memberDiv.className = 'team-member'; // Base class

             if (member.type === 'member') {
                 const img = document.createElement('img');
                 img.src = member.imagePath || 'placeholder_default.png'; // Default placeholder
                 img.alt = member.name;
                 memberDiv.appendChild(img);

                 const nameP = document.createElement('p');
                 nameP.className = 'name';
                 nameP.innerHTML = `<strong>${member.name}</strong>`;
                 memberDiv.appendChild(nameP);

                 const titleP = document.createElement('p');
                 titleP.className = 'title';
                 titleP.textContent = member.title;
                 memberDiv.appendChild(titleP);

                 const emailP = document.createElement('p');
                 emailP.className = 'email';
                 const emailA = document.createElement('a');
                 emailA.href = `mailto:${member.email}`;
                 emailA.textContent = member.email;
                 emailP.appendChild(emailA);
                 memberDiv.appendChild(emailP);

                 if (member.phone) {
                     const phoneP = document.createElement('p');
                     phoneP.className = 'phone';
                     phoneP.textContent = member.phone;
                     memberDiv.appendChild(phoneP);
                 }
             } else if (member.type === 'qrCode') {
                 memberDiv.classList.add('schedule-section'); // Add specific class

                 const img = document.createElement('img');
                 img.src = member.imagePath;
                 img.alt = "QR Code for Scheduling";
                 img.className = 'qr-code';
                 memberDiv.appendChild(img);

                 const linkA = document.createElement('a');
                 linkA.href = member.linkUrl || '#';
                 linkA.className = 'schedule-link';
                 linkA.textContent = member.linkText || 'Schedule';
                 memberDiv.appendChild(linkA);
             }
             teamContainer.appendChild(memberDiv);
         });
     }

    // --- Populate Footer ---
    const footerContainer = document.getElementById('footer-content');
    if (footerContainer && data.footer) {
        footerContainer.innerHTML = ''; // Clear default
        const p1 = document.createElement('p');
        p1.textContent = data.footer.line1;
        footerContainer.appendChild(p1);
        const p2 = document.createElement('p');
        p2.textContent = data.footer.line2;
        footerContainer.appendChild(p2);
    }
}

// Helper function to safely set text content
function setTextContent(selector, text) {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = text || ''; // Set to empty string if text is null/undefined
    } else {
         console.warn(`Element not found for selector: ${selector}`);
    }
}