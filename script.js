document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('searchBtn');
    const usernameInput = document.getElementById('usernameInput');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const profileSection = document.getElementById('profileSection');

    // Search button click event
    searchBtn.addEventListener('click', fetchGitHubData);
    
    // Enter key press event
    usernameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            fetchGitHubData();
        }
    });

    async function fetchGitHubData() {
        const username = usernameInput.value.trim();
        
        if (!username) {
            showError('Please enter a GitHub username');
            return;
        }

        // Show loading state
        loading.style.display = 'block';
        error.style.display = 'none';
        profileSection.style.display = 'none';
        searchBtn.disabled = true;

        try {
            // Fetch user data
            const userResponse = await fetch(`https://api.github.com/users/${username}`);
            
            if (!userResponse.ok) {
                throw new Error(userResponse.status === 404 ? 'User not found' : 'Failed to fetch user data');
            }
            
            const userData = await userResponse.json();
            
            // Fetch repositories
            const reposResponse = await fetch(userData.repos_url);
            if (!reposResponse.ok) {
                throw new Error('Failed to fetch repositories');
            }
            const reposData = await reposResponse.json();
            
            // Process and display data
            displayUserProfile(userData);
            displayRepositories(reposData);
            analyzeLanguages(reposData);
            createCharts(reposData);
            
            // Show profile section
            profileSection.style.display = 'block';
        } catch (err) {
            showError(err.message);
        } finally {
            loading.style.display = 'none';
            searchBtn.disabled = false;
        }
    }

    function showError(message) {
        error.textContent = message;
        error.style.display = 'block';
    }

    function displayUserProfile(user) {
        // Basic info
        document.getElementById('avatar').src = user.avatar_url;
        document.getElementById('profileName').textContent = user.name || user.login;
        document.getElementById('profileUsername').textContent = `@${user.login}`;
        document.getElementById('profileBio').textContent = user.bio || 'No bio available';
        
        // Stats
        document.getElementById('reposCount').textContent = user.public_repos;
        document.getElementById('followersCount').textContent = user.followers;
        document.getElementById('followingCount').textContent = user.following;
        document.getElementById('gistsCount').textContent = user.public_gists;
        
        // Meta info
        const locationEl = document.getElementById('profileLocation');
        if (user.location) {
            locationEl.querySelector('span').textContent = user.location;
        } else {
            locationEl.style.display = 'none';
        }
        
        const websiteEl = document.getElementById('profileWebsite');
        if (user.blog) {
            const websiteLink = document.getElementById('websiteLink');
            websiteLink.href = user.blog.startsWith('http') ? user.blog : `https://${user.blog}`;
            websiteLink.textContent = user.blog;
        } else {
            websiteEl.style.display = 'none';
        }
        
        const twitterEl = document.getElementById('profileTwitter');
        if (user.twitter_username) {
            const twitterLink = document.getElementById('twitterLink');
            twitterLink.href = `https://twitter.com/${user.twitter_username}`;
            twitterLink.textContent = `@${user.twitter_username}`;
        } else {
            twitterEl.style.display = 'none';
        }
        
        const joinedEl = document.getElementById('profileJoined');
        if (user.created_at) {
            const joinedDate = new Date(user.created_at).toLocaleDateString();
            joinedEl.querySelector('span').textContent = `Joined ${joinedDate}`;
        } else {
            joinedEl.style.display = 'none';
        }
    }

    function displayRepositories(repos) {
        const repoList = document.getElementById('repoList');
        repoList.innerHTML = '';
        
        // Sort by stars descending
        const sortedRepos = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count);
        
        // Display top 6 repos
        sortedRepos.slice(0, 6).forEach(repo => {
            const repoCard = document.createElement('div');
            repoCard.className = 'repo-card';
            
            const lastUpdated = new Date(repo.updated_at).toLocaleDateString();
            
            repoCard.innerHTML = `
                <a href="${repo.html_url}" class="repo-name" target="_blank">${repo.name}</a>
                <p class="repo-description">${repo.description || 'No description available'}</p>
                <div class="repo-meta">
                    <span class="repo-meta-item">
                        <i class="fas fa-star"></i> ${repo.stargazers_count}
                    </span>
                    <span class="repo-meta-item">
                        <i class="fas fa-code-branch"></i> ${repo.forks_count}
                    </span>
                    ${repo.language ? `
                    <span class="repo-meta-item">
                        <span class="language-color" style="background-color: ${getLanguageColor(repo.language)}"></span>
                        ${repo.language}
                    </span>
                    ` : ''}
                    <span class="repo-meta-item">
                        <i class="fas fa-clock"></i> Updated ${lastUpdated}
                    </span>
                </div>
            `;
            
            repoList.appendChild(repoCard);
        });
        
        // Create activity cards
        const activityGrid = document.getElementById('activityGrid');
        activityGrid.innerHTML = '';
        
        // Most starred repo
        if (sortedRepos.length > 0) {
            const mostStarred = sortedRepos[0];
            activityGrid.appendChild(createActivityCard(
                'Most Starred Repo',
                mostStarred.stargazers_count,
                mostStarred.name,
                'fas fa-star'
            ));
        }
        
        // Total stars
        const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
        activityGrid.appendChild(createActivityCard(
            'Total Stars',
            totalStars,
            'All repositories',
            'fas fa-star'
        ));
        
        // Total forks
        const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
        activityGrid.appendChild(createActivityCard(
            'Total Forks',
            totalForks,
            'All repositories',
            'fas fa-code-branch'
        ));
        
        // Average stars per repo
        const avgStars = repos.length > 0 ? (totalStars / repos.length).toFixed(1) : 0;
        activityGrid.appendChild(createActivityCard(
            'Avg Stars/Repo',
            avgStars,
            'Average stars',
            'fas fa-star-half-alt'
        ));
    }

    function createActivityCard(title, value, subtitle, icon) {
        const card = document.createElement('div');
        card.className = 'activity-card';
        
        card.innerHTML = `
            <h4 class="activity-title">${title}</h4>
            <div class="activity-value">${value}</div>
            <div style="color: #57606a; font-size: 14px;">
                <i class="${icon}"></i> ${subtitle}
            </div>
        `;
        
        return card;
    }

    function analyzeLanguages(repos) {
        const languages = {};
        
        repos.forEach(repo => {
            if (repo.language) {
                languages[repo.language] = (languages[repo.language] || 0) + 1;
            }
        });
        
        return languages;
    }

    function createCharts(repos) {
        const languages = analyzeLanguages(repos);
        
        // Languages chart
        const languagesCtx = document.getElementById('languagesChart').getContext('2d');
        new Chart(languagesCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(languages),
                datasets: [{
                    data: Object.values(languages),
                    backgroundColor: Object.keys(languages).map(lang => getLanguageColor(lang)),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        
        // Repo stats chart
        const repoStatsCtx = document.getElementById('repoStatsChart').getContext('2d');
        const sortedRepos = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count);
        const topRepos = sortedRepos.slice(0, 5);
        
        new Chart(repoStatsCtx, {
            type: 'bar',
            data: {
                labels: topRepos.map(repo => repo.name),
                datasets: [
                    {
                        label: 'Stars',
                        data: topRepos.map(repo => repo.stargazers_count),
                        backgroundColor: '#0366d6',
                        borderWidth: 1
                    },
                    {
                        label: 'Forks',
                        data: topRepos.map(repo => repo.forks_count),
                        backgroundColor: '#28a745',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        
        // Commit activity chart (simulated data)
        const commitCtx = document.getElementById('commitActivityChart').getContext('2d');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const commitData = months.map(() => Math.floor(Math.random() * 100));
        
        new Chart(commitCtx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Commits',
                    data: commitData,
                    borderColor: '#0366d6',
                    backgroundColor: 'rgba(3, 102, 214, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Simple language color mapping
    function getLanguageColor(language) {
        const colors = {
            'JavaScript': '#f1e05a',
            'Python': '#3572A5',
            'Java': '#b07219',
            'TypeScript': '#3178c6',
            'C++': '#f34b7d',
            'C': '#555555',
            'C#': '#178600',
            'PHP': '#4F5D95',
            'Ruby': '#701516',
            'Go': '#00ADD8',
            'Swift': '#ffac45',
            'Kotlin': '#F18E33',
            'Rust': '#dea584',
            'Shell': '#89e051',
            'HTML': '#e34c26',
            'CSS': '#563d7c',
            'Vue': '#41b883',
            'Dart': '#00B4AB',
            'Elixir': '#6e4a7e',
            'Clojure': '#db5855',
            'Scala': '#c22d40',
            'R': '#198CE7',
            'Objective-C': '#438eff',
            'Perl': '#0298c3',
            'Lua': '#000080',
            'Haskell': '#5e5086',
            'PowerShell': '#012456',
            'TeX': '#3D6117',
            'Assembly': '#6E4C13',
            'Groovy': '#e69f56',
            'Julia': '#a270ba',
            'Dockerfile': '#384d54',
            'Makefile': '#427819',
            'CMake': '#DA3434'
        };
        
        return colors[language] || '#cccccc';
    }
});