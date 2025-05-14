document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const processButton = document.getElementById('processButton');
    const resultsArea = document.getElementById('resultsArea');
    const highlightedTextOutput = document.getElementById('highlightedTextOutput');

    const targetPhrases = [
        "a little", "a lot", "bad", "big", "boring", "clean", "easy", "fun",
        "good", "happy", "hard", "interesting", "kind", "mad", "nice", "old",
        "really", "sad", "slow", "short", "small", "stuff", "thing", "very", "ugly"
    ];

    // Function to escape special characters for use in a regular expression
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    function countAndHighlightWords() {
        const inputText = textInput.value;
        if (!inputText.trim()) {
            resultsArea.innerHTML = "<p>Please enter some text.</p>";
            highlightedTextOutput.innerHTML = "<p>Text will be highlighted here.</p>";
            return;
        }

        const processedTextForCounting = inputText.toLowerCase();
        const counts = {};
        let foundAny = false;

        // --- Counting Logic ---
        targetPhrases.forEach(phrase => {
            const phraseLower = phrase.toLowerCase();
            let count = 0;

            if (phraseLower.includes(' ')) {
                // Multi-word phrase: simple substring count
                // This mimics Python's string.count()
                let pos = processedTextForCounting.indexOf(phraseLower);
                while (pos !== -1) {
                    count++;
                    pos = processedTextForCounting.indexOf(phraseLower, pos + phraseLower.length); // Start search after current match
                }
            } else {
                // Single word: regex for whole word matching
                const pattern = new RegExp("\\b" + escapeRegExp(phraseLower) + "\\b", "g");
                const matches = processedTextForCounting.match(pattern);
                count = matches ? matches.length : 0;
            }
            counts[phrase] = count;
            if (count > 0) {
                foundAny = true;
            }
        });

        // --- Display Counts ---
        resultsArea.innerHTML = ''; // Clear previous results
        if (foundAny) {
            const ul = document.createElement('ul');
            for (const phrase in counts) {
                if (counts[phrase] > 0) {
                    const li = document.createElement('li');
                    li.textContent = `'${phrase}': ${counts[phrase]}`;
                    ul.appendChild(li);
                }
            }
            resultsArea.appendChild(ul);
        } else {
            resultsArea.innerHTML = "<p>None of the target words/phrases were found.</p>";
        }

        // --- Highlighting Logic ---
        let highlightedHtml = inputText;

        // Sort phrases by length (descending) to prioritize longer matches
        // e.g., "a lot" should be matched before "a" or "lot" if they were targets
        const phrasesToHighlight = targetPhrases
            .filter(p => counts[p] > 0) // Only consider phrases that were actually found
            .sort((a, b) => b.length - a.length);

        phrasesToHighlight.forEach(phrase => {
            const escapedPhrase = escapeRegExp(phrase);
            let regex;
            if (phrase.includes(' ')) {
                // Multi-word phrase: global, case-insensitive.
                // We want to match the exact phrase as it appears.
                regex = new RegExp(`(${escapedPhrase})`, 'gi');
            } else {
                // Single word: global, case-insensitive, whole word.
                regex = new RegExp(`(\\b${escapedPhrase}\\b)`, 'gi');
            }
            // Replace, using a function to preserve the original casing of the matched word
            highlightedHtml = highlightedHtml.replace(regex, (match) => `<mark>${match}</mark>`);
        });

        highlightedTextOutput.innerHTML = highlightedHtml.replace(/\n/g, '<br>'); // Preserve line breaks
        if (!highlightedHtml.trim()) { // If original input was just spaces
             highlightedTextOutput.innerHTML = "<p>Text will be highlighted here.</p>";
        }
    }

    processButton.addEventListener('click', countAndHighlightWords);
});