import os

files = [
    'agent-chat-vs-agent.html',
    'agent-core-components.html',
    'agent-six-layer-architecture.html',
    'ai-trends-2026.html',
    'enterprise-private-agent-architecture.html',
    'manufacturing-ai-case-study.html',
    'private-agent-deployment-strategy.html',
    'private-agent-security-compliance.html',
    'smb-ai-strategy-guide.html'
]

dir_path = '/Users/jliu/ai_consultant/asset/'

button_html = '''            <button class="theme-toggle" id="theme-toggle" title="Toggle Theme">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="moon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sun" style="display:none;"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            </button>
          </nav>'''

script_html = '''    <script>
      const themeToggle = document.getElementById('theme-toggle');
      const moonIcon = themeToggle.querySelector('.moon');
      const sunIcon = themeToggle.querySelector('.sun');
      const htmlElement = document.documentElement;

      // Check for saved theme preference
      const currentTheme = localStorage.getItem('theme');
      if (currentTheme === 'light') {
        htmlElement.classList.add('theme-light');
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
      }

      themeToggle.addEventListener('click', () => {
        htmlElement.classList.toggle('theme-light');
        const isLight = htmlElement.classList.contains('theme-light');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        
        moonIcon.style.display = isLight ? 'none' : 'block';
        sunIcon.style.display = isLight ? 'block' : 'none';
      });
    </script>
  </body>'''

for file_name in files:
    file_path = os.path.join(dir_path, file_name)
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add button
    content = content.replace('            <a href="../index.html#contact">CONTACT</a>\n          </nav>', 
                             '            <a href="../index.html#contact">CONTACT</a>\n' + button_html)
    
    # Add script
    content = content.replace('  </body>', script_html)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Updated {file_name}')
