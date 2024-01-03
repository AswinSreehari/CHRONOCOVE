module.exports = { getGoogleOAuthURL }

function getGoogleOAuthURL() {
    const rootURL = 'https://accounts.google.com/o/oauth2/v2/auth';
    const qs = new URLSearchParams();
    qs.append('redirect_uri', "http://localhost:7000/google-signin/callback");
    qs.append('client_id', process.env.GOOGLE_OAUTH_CLIENT_ID)
    qs.append('access_type', 'offline');
    qs.append('response_type', 'code');
    qs.append('prompt', 'consent');
    qs.append('scope', [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email"
    ].join(' '));

    return `${rootURL}?${qs.toString()}`;
}

