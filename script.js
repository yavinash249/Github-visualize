document.addEventListener('DOMContentLoaded', function(){
    const searchBtn = document.getElementById('searchBtn');
    const usernameInput = document.getElementById('usernameInput');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const profileSection = document.getElementById('profileSection');

    // Search button click event
    searchBtn.addEventListener('click',fetchGithubData);
    // Enter key press 

    usernameInput.addEventListener('keypress',function(e){
        if(e.key === 'Enter'){
            fetchGithubData();
        }
    });

    async function fetchGithubData(){
        const username = usernameInput.ariaValueMax.trim();

        if(!username){
            showError('Please enter a Github username');
            return;
        }

        // show loading state
        loading.style.display = 'block';
        error.style.display = 'none';
        profileSection.style.display = 'none';
        searchBtn.disabled = true;

        try {
            // fetchuser data
            const userResponse = await fetch(`https://api.github.com/users/${username}`);

            if(!userResponse.ok){
                throw new Error(userResponse.status === 404 ? 'user not found' : 'Failed to fetch user data');
            }

            const userData = await userResponse.json();

            // fetch repos data
            
        }
    }
});