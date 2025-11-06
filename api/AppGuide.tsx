


import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from './components/common/Card';
import { useI18n } from '../hooks/useI18n';
import { Info, Server, ClipboardList, GitBranch, HardDriveUpload, Play, Bot, Users, BarChart3, BookOpen } from './components/LucideIcons';

const GuideSection: React.FC<{ title: string, id: string, children: React.ReactNode }> = ({ title, id, children }) => (
    <Card id={id} className="mb-8 scroll-mt-24">
        <CardHeader>
            <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <div className="p-6 prose prose-sm sm:prose-base prose-invert max-w-none prose-headings:text-gray-100 prose-strong:text-gray-100 prose-a:text-primary-400 hover:prose-a:text-primary-300 prose-code:text-yellow-300 prose-code:bg-gray-800 prose-code:p-1 prose-code:rounded-md prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700 prose-table:border-gray-600 prose-th:text-gray-100 prose-tr:border-gray-700">
            {children}
        </div>
    </Card>
);

const tocItems = [
    { id: 'overview', key: 'overview', icon: <Info className="h-5 w-5" /> },
    { id: 'architecture', key: 'architecture', icon: <Server className="h-5 w-5" /> },
    { id: 'features', key: 'features', icon: <ClipboardList className="h-5 w-5" /> },
    { id: 'logicflow', key: 'logicflow', icon: <GitBranch className="h-5 w-5" /> },
    { id: 'deployment', key: 'deployment', icon: <HardDriveUpload className="h-5 w-5" /> },
    { id: 'operation', key: 'operation', icon: <Play className="h-5 w-5" /> },
    { id: 'aitraining', key: 'aitraining', icon: <Bot className="h-5 w-5" /> },
    { id: 'roles', key: 'roles', icon: <Users className="h-5 w-5" /> },
    { id: 'proscons', key: 'proscons', icon: <BarChart3 className="h-5 w-5" /> },
    { id: 'appendix', key: 'appendix', icon: <BookOpen className="h-5 w-5" /> },
];

const sectionTitles: Record<string, { en: string, vi: string }> = {
    overview: { en: "1. Overview", vi: "1. Tổng quan" },
    architecture: { en: "2. System Architecture", vi: "2. Kiến trúc hệ thống" },
    features: { en: "3. Components & Features", vi: "3. Thành phần & Chức năng" },
    logicflow: { en: "4. Logic Flow", vi: "4. Luồng hoạt động" },
    deployment: { en: "5. Installation & Deployment", vi: "5. Cài đặt & Triển khai" },
    operation: { en: "6. Operation Manual", vi: "6. Hướng dẫn vận hành" },
    aitraining: { en: "7. AI Training & Optimization", vi: "7. Đào tạo & tối ưu AI" },
    roles: { en: "8. Team & Roles", vi: "8. Phân công nhiệm vụ" },
    proscons: { en: "9. Pros & Cons", vi: "9. Ưu & Nhược điểm" },
    appendix: { en: "10. Appendix", vi: "10. Phụ lục" },
};

export const AppGuide: React.FC = () => {
    const { t, locale } = useI18n();

    const EnglishContent = () => (
        <>
            <GuideSection title="1. Overview" id="overview">
                <h3>Introduction</h3>
                <p><strong>NebulaForge AI</strong> is a comprehensive, no-face, fully automated application designed to streamline the entire workflow of a digital content creation business. It leverages the power of Google's Gemini AI to scout for trending digital products, generate complete video scripts and social media assets, produce high-quality videos, and manage publishing pipelines. The primary goal is to create a scalable system for generating passive income through affiliate marketing and ad revenue with minimal human intervention.</p>
                <h3>Target Audience</h3>
                <ul>
                    <li><strong>Content Creators:</strong> Individuals or teams looking to automate their video production for review channels.</li>
                    <li><strong>Affiliate Marketers:</strong> Marketers aiming to scale their campaigns by automating content creation for various products.</li>
                    <li><strong>Digital Agencies:</strong> Agencies that provide content and marketing services to clients and want to improve efficiency.</li>
                </ul>
                <h3>Key Benefits</h3>
                <ul>
                    <li><strong>Efficiency:</strong> Automates over 90% of the content creation process, from ideation to final video rendering.</li>
                    <li><strong>Scalability:</strong> Easily scale content production from one video a week to dozens per day without a proportional increase in effort.</li>
                    <li><strong>Passive Income:</strong> Designed to run 24/7, continuously finding opportunities and creating content to generate revenue.</li>
                    <li><strong>Data-Driven:</strong> Utilizes AI to identify high-potential products based on affiliate commissions and market trends.</li>
                </ul>
            </GuideSection>
            
            <GuideSection title="2. System Architecture" id="architecture">
                <p>The system is built on a modern, serverless architecture, ensuring scalability, security, and maintainability.</p>
                <h3>Core Components</h3>
                <ul>
                    <li><strong>Frontend:</strong> A Single Page Application (SPA) built with <strong>React</strong>, <strong>TypeScript</strong>, and styled with <strong>Tailwind CSS</strong>. It provides a dynamic and responsive user interface for managing the entire system.</li>
                    <li><strong>Backend Proxy:</strong> A serverless function deployed on <strong>Vercel</strong> (<code>/api/proxy</code>) acts as a secure backend. It handles all communications with the Google AI API, ensuring that the API key is never exposed to the client-side.</li>
                    <li><strong>AI Services:</strong> The system exclusively uses the <strong>Google Gemini API</strong> for all intelligent tasks, including text generation (<code>gemini-2.5-flash</code>), video generation (<code>veo-3.1</code> models), and text-to-speech (<code>gemini-2.5-flash-preview-tts</code>).</li>
                    <li><strong>Data Storage:</strong> For simplicity and portability in this version, connection credentials are saved in the browser's <strong>localStorage</strong>. <strong>Note:</strong> For a production environment, it is critical to move this sensitive data to a secure backend vault (e.g., Vercel Environment Variables, Google Secret Manager).</li>
                    <li><strong>Deployment:</strong> The entire application is seamlessly deployed and hosted on <strong>Vercel</strong>, leveraging its CI/CD pipeline for automatic builds and deployments from a Git repository.</li>
                </ul>
                <h3>Architecture Diagram (Mermaid)</h3>
                <pre><code>{`
    graph TD
        A[User Interface (React, Vite)] -->|Manages System| B(Vercel Hosting)
        A -->|API Calls via Proxy| C{/api/proxy (Vercel Serverless Function)}
        C -->|Secure API Calls| D[Google Gemini API]
        D -->|Text Generation| E[gemini-2.5-flash]
        D -->|Video Generation| F[veo-3.1 models]
        D -->|Speech Synthesis| G[gemini-2.5-flash-preview-tts]
        A -->|Store/Read Credentials (Demo)| H(Browser localStorage)
                `}</code></pre>
            </GuideSection>
            
            <GuideSection title="3. Components & Features" id="features">
                <p>The application is divided into several modules, each handling a specific part of the workflow.</p>
                <table>
                    <thead>
                        <tr>
                            <th>Component</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td><strong>Dashboard</strong></td><td>Provides a high-level overview of key metrics like revenue, costs, and profit. Displays a live system log of agent activities.</td></tr>
                        <tr><td><strong>Automation</strong></td><td>The control center for all automated processes. Users can enable/disable the master switch and configure the behavior of agents like the Product Scout.</td></tr>
                        <tr><td><strong>Product Scout</strong></td><td>An AI-powered module to discover new, trending digital products. It analyzes their potential profitability and adds them to a queue for user approval.</td></tr>
                        <tr><td><strong>Prompt Templates</strong></td><td>Allows customization of the AI's behavior by editing the core prompts used for content generation, enabling users to fine-tune the style and tone of the output.</td></tr>
                        <tr><td><strong>Content Generator</strong></td><td>Takes an approved product and uses Gemini to generate all necessary text assets: video script, viral titles, SEO-optimized description, and social media captions.</td></tr>
                        <tr><td><strong>Studio</strong></td><td>The advanced production hub. Configure video models, add reference images, assign voices for multi-speaker scripts, and generate the final video.</td></tr>
                        <tr><td><strong>Render Queue</strong></td><td>Tracks the real-time progress of all video rendering jobs. Allows users to monitor status and download the final video and audio files upon completion.</td></tr>
                        <tr><td><strong>Connections</strong></td><td>A centralized hub for managing credentials for various platforms. In the current version, this data is stored locally.</td></tr>
                        <tr><td><strong>Analytics</strong></td><td>Visualizes performance data, including views over time, revenue per product, and performance breakdowns by platform. (Note: Data is currently simulated).</td></tr>
                        <tr><td><strong>Finance</strong></td><td>Tracks financial performance, including total revenue, costs, net profit, and ROI for each published video. (Note: Data is currently simulated).</td></tr>
                    </tbody>
                </table>
            </GuideSection>
            
            <GuideSection title="4. Logic Flow" id="logicflow">
                <p>The system follows a logical, sequential workflow from product discovery to content publication.</p>
                <ol>
                    <li><strong>Configuration:</strong> The user first configures the system in the <strong>Connections</strong> and <strong>Automation</strong> tabs. This includes setting up API credentials and defining automation rules (e.g., how often the scout agent should run).</li>
                    <li><strong>Scouting:</strong> The <strong>Product Scout</strong> agent, either triggered manually or by the automation engine, calls the Gemini API with a specific topic. Gemini returns a list of potential products. The system then enriches this data with an "Opportunity Score".</li>
                    <li><strong>Approval:</strong> Products found by the scout are placed in a pending queue. The user can manually review and approve them, or the automation engine can auto-approve products that meet a predefined score threshold.</li>
                    <li><strong>Content Generation:</strong> Once a product is approved, it moves to the <strong>Content Generator</strong>. Here, the system uses the customized prompts from <strong>Prompt Templates</strong> to ask Gemini to create a script, titles, description, and captions.</li>
                    <li><strong>Video Production:</strong> The user navigates to the <strong>Studio</strong>, selects the product with its generated content, chooses video/audio models and reference images, and clicks "Create Video". This sends a request to the backend proxy, which calls the Gemini Veo and TTS APIs. A new job appears in the <strong>Render Queue</strong>.</li>
                    <li><strong>Monitoring & Download:</strong> The system periodically polls the Gemini API to check the status of the rendering job. The progress is updated in the UI. Once completed, a download link for the MP4 video becomes available.</li>
                </ol>
                <h3>Workflow Diagram (Mermaid)</h3>
                <pre><code>{`
    graph LR
        subgraph "1. Setup"
            A[Connections] --> B[Automation Rules]
        end
        subgraph "2. Discovery"
            B --> C{Product Scout} -->|Finds Products| D[Pending Queue]
        end
        subgraph "3. Content Creation"
            D -->|Approve| E[Content Generator] -->|Generates Assets| F[Ready for Production]
        end
        subgraph "4. Video Production"
            F --> G[Studio] -->|Creates Job| H[Render Queue]
        end
        subgraph "5. Finalization"
             H -->|Job Done| I[Download Video] --> J[Analytics]
        end
                `}</code></pre>
            </GuideSection>
            
            <GuideSection title="5. Installation & Deployment" id="deployment">
                <h3>Prerequisites</h3>
                <ul>
                    <li>Node.js (v18 or newer)</li>
                    <li>npm or yarn</li>
                    <li>A Vercel account</li>
                    <li>A Google AI Studio API Key</li>
                </ul>
                <h3>Local Development</h3>
                <ol>
                    <li>Clone the repository: <br/><code>git clone &lt;repository_url&gt;</code></li>
                    <li>Navigate to the project directory: <br/><code>cd nebulaforge-ai</code></li>
                    <li>Install dependencies: <br/><code>npm install</code></li>
                    <li>Create a <code>.env.local</code> file in the root directory.</li>
                    <li>Add your Google AI Studio API key to the file: <br/><code>API_KEY="your_gemini_api_key_here"</code></li>
                    <li><strong>In a separate terminal</strong>, start the backend proxy server: <br/><code>node server.js</code></li>
                    <li>In your original terminal, start the development server: <br/><code>npm run dev</code></li>
                    <li>The application will be available at <code>http://localhost:5173</code> (or another port if 5173 is in use).</li>
                </ol>
                <h3>Deployment to Vercel</h3>
                <ol>
                    <li>Push your code to a Git repository (GitHub, GitLab, Bitbucket).</li>
                    <li>Log in to your Vercel account and create a new project.</li>
                    <li>Import the Git repository you just created.</li>
                    <li>Vercel will automatically detect the Vite + React framework. No changes are needed in the build settings.</li>
                    <li>Navigate to the project's "Settings" tab and then to "Environment Variables".</li>
                    <li>Add a new environment variable with the key <code>API_KEY</code> and paste your Google AI Studio API key as the value.</li>
                    <li>Click "Deploy". Vercel will build and deploy your application. After a few minutes, it will be live on a public URL.</li>
                </ol>
            </GuideSection>
            
            <GuideSection title="6. Operation Manual" id="operation">
                <h3>Step 1: Initial Setup</h3>
                <ul>
                    <li>Go to the <strong>Connections</strong> page. For this demo version, you don't need to add any credentials here as they are not used for publishing. However, in a production version, this would be the first step.</li>
                    <li>Navigate to the <strong>Studio</strong> page. If you haven't selected an API key for video generation, you will be prompted to. This is a mandatory step to use the Veo model.</li>
                </ul>
                <h3>Step 2: Configure Automation</h3>
                <ul>
                    <li>Visit the <strong>Automation</strong> page. Enable the "Master Automation Switch" to allow agents to run.</li>
                    <li>Set the "Run Frequency" for the Scout Agent and define a "Default Topic" for it to search for.</li>
                </ul>
                <h3>Step 3: Find Products</h3>
                <ul>
                    <li>Go to the <strong>Product Scout</strong> page.</li>
                    <li>Enter a niche (e.g., "AI productivity tools") and click "Scout Products".</li>
                    <li>Review the products that appear in the "Agent Awaiting Approval" list.</li>
                </ul>
                <h3>Step 4: Generate Content</h3>
                <ul>
                    <li>Approve a product from the scout list. You will be automatically taken to the <strong>Content Generator</strong> page.</li>
                    <li>Click "Generate All Assets". The AI will create a script, titles, description, and captions.</li>
                    <li>Review the generated text. You can click "Edit" on any section to make changes. Select your favorite title from the list.</li>
                </ul>
                <h3>Step 5: Create the Video</h3>
                <ul>
                    <li>Go to the <strong>Studio</strong> page. The product you just processed will be listed.</li>
                    <li>Select your desired Video Model and Audio Voice from the dropdowns.</li>
                    <li>(Optional) Upload up to 3 reference images to guide the video generation.</li>
                    <li>Click "Create Video". The job will be sent to the <strong>Render Queue</strong>.</li>
                </ul>
                <h3>Step 6: Monitor and Download</h3>
                <ul>
                    <li>Go to the <strong>Render Queue</strong>. You will see your job with a "Rendering" status.</li>
                    <li>The progress bar will update as the video is created. This can take several minutes.</li>
                    <li>Once the status changes to "Completed", the "Download Video" button will become active. Click it to save your MP4 file.</li>
                </ul>
            </GuideSection>
            
            <GuideSection title="7. AI Training & Optimization" id="aitraining">
                <h3>Understanding AI Prompts</h3>
                <p>The quality and style of the content generated by the system are entirely dependent on the prompts provided to the Gemini AI. "Training" the AI in this context means refining these prompts to produce the desired output. The system is designed to make this process easy and accessible.</p>
                <h3>Customizing Prompts</h3>
                <ol>
                    <li>Navigate to the <strong>Prompt Templates</strong> page.</li>
                    <li>You will see a list of default templates for different content types (Script, Titles, etc.).</li>
                    <li>Click on any template to load it into the editor on the right.</li>
                    <li>Modify the text in the "Prompt Content" area. You can change the instructions, tone, structure, or add new requirements.</li>
                    <li>Click "Save Template". Your changes will be used for all future content generations of that type.</li>
                </ol>
                <h3>Prompt Engineering Best Practices</h3>
                <ul>
                    <li><strong>Be Specific:</strong> Instead of "write a script", say "Write a concise 60-second video script for a YouTube Shorts review". The more specific your instructions, the better the result.</li>
                    <li><strong>Use Placeholders:</strong> The system uses placeholders like <code>{`{{product_name}}`}</code> and <code>{`{{description}}`}</code> to dynamically insert product data into the prompt. Make sure to include these where relevant.</li>
                    <li><strong>Define the Tone:</strong> Explicitly state the desired tone, e.g., "Tone: Energetic, trustworthy, and clear."</li>
                    <li><strong>Provide Examples (Few-shot Prompting):</strong> In the prompt, give examples of the output you want. For instance, the "Video Title Generator" prompt includes examples like "This AI is INSANE!".</li>
                    <li><strong>Iterate:</strong> Don't be afraid to experiment. If you're not getting the desired output, tweak the prompt and try regenerating the content. Small changes can have a big impact.</li>
                </ul>
            </GuideSection>
            
            <GuideSection title="8. Team & Roles" id="roles">
                 <p>While a single person can operate the system, it's designed to support a team workflow. Here are some suggested roles:</p>
                <table>
                    <thead>
                        <tr>
                            <th>Role</th>
                            <th>Responsibilities</th>
                            <th>Key Modules</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Content Strategist</strong></td>
                            <td>Identifies target niches, analyzes market trends, and sets the high-level content strategy. Configures automation rules to align with goals.</td>
                            <td>Product Scout, Analytics, Automation</td>
                        </tr>
                        <tr>
                            <td><strong>Content Manager</strong></td>
                            <td>Reviews and approves products found by the Scout Agent. Edits and refines all AI-generated text content to ensure quality and brand alignment. Manages and optimizes prompt templates.</td>
                            <td>Product Scout, Content Generator, Prompt Templates</td>
                        </tr>
                        <tr>
                            <td><strong>Video Producer</strong></td>
                            <td>Manages the video production pipeline. Selects AI models in the Studio, initiates rendering, and handles the final video assets from the Render Queue.</td>
                            <td>Studio, Render Queue</td>
                        </tr>
                        <tr>
                            <td><strong>System Administrator</strong></td>
                            <td>Manages system configuration, including API keys and credentials in the Connections hub. Oversees deployment and monitors system health.</td>
                            <td>Connections, System Status</td>
                        </tr>
                    </tbody>
                </table>
            </GuideSection>

            <GuideSection title="9. Pros & Cons" id="proscons">
                <h3>Pros (Strengths)</h3>
                <ul>
                    <li><strong>High Automation:</strong> The system automates the most time-consuming parts of content creation, from research to final render.</li>
                    <li><strong>End-to-End Workflow:</strong> It covers the entire process within a single, unified interface.</li>
                    <li><strong>Extreme Customizability:</strong> The prompt-based nature of the AI allows for deep customization of content style, tone, and format.</li>
                    <li><strong>Scalability:</strong> The serverless architecture and automated workflow allow for massive scaling of content output.</li>
                    <li><strong>Modern Tech Stack:</strong> Built with industry-standard technologies (React, TypeScript, Vercel) ensuring it is maintainable and extensible.</li>
                </ul>
                <h3>Cons (Weaknesses & Limitations)</h3>
                <ul>
                    <li><strong>API Dependency:</strong> The system is entirely dependent on the Google Gemini API. Any changes, downtime, or costs associated with the API will directly impact the system.</li>
                    <li><strong>Insecure Credential Storage:</strong> The use of <code>localStorage</code> for API keys in the Connections Hub is <strong>not secure for production use</strong> and is implemented for demonstration purposes only. A secure backend vault is required for a real-world application.</li>
                    <li><strong>Simulated Data:</strong> The publishing, analytics, and financial data are currently simulated. A real implementation would require integration with platform APIs (e.g., YouTube API) and affiliate network APIs to fetch real data.</li>
                    <li><strong>Lack of Real Publishing:</strong> The final step of automatically uploading the video to platforms like YouTube is not implemented. This is a significant feature required for full automation.</li>
                </ul>
            </GuideSection>

            <GuideSection title="10. Appendix" id="appendix">
                <h3>Technology Stack</h3>
                <ul>
                    <li><strong>Frontend:</strong> React 18, Vite, TypeScript</li>
                    <li><strong>Styling:</strong> Tailwind CSS</li>
                    <li><strong>Animation:</strong> Framer Motion</li>
                    <li><strong>3D Graphics:</strong> Three.js (for the starfield background)</li>
                    <li><strong>AI:</strong> Google Gemini API (@google/genai)</li>
                    <li><strong>Deployment:</strong> Vercel</li>
                </ul>
                <h3>API & Documentation Links</h3>
                <ul>
                    <li><a href="https://ai.google.dev/gemini-api/docs" target="_blank" rel="noopener noreferrer">Google Gemini API Documentation</a></li>
                    <li><a href="https://ai.google.dev/gemini-api/docs/models/veo" target="_blank" rel="noopener noreferrer">Veo Video Model Documentation</a></li>
                    <li><a href="https://react.dev/" target="_blank" rel="noopener noreferrer">React Documentation</a></li>
                    <li><a href="https://vercel.com/docs" target="_blank" rel="noopener noreferrer">Vercel Documentation</a></li>
                </ul>
                <h3>Common Troubleshooting</h3>
                <ul>
                    <li><strong>Video Generation Fails with API Key Error:</strong> This is the most common issue. Go to the <strong>Studio</strong> page and re-select your Google AI API key. Ensure the key is valid, active, and has billing enabled on its associated Google Cloud project.</li>
                    <li><strong>Application Fails to Load:</strong> Clear your browser cache and cookies. Check the browser's developer console (F12) for any error messages.</li>
                    <li><strong>Vercel Deployment Fails:</strong> Ensure the <code>API_KEY</code> environment variable is correctly set in your Vercel project settings. Check the build logs on Vercel for specific error details.</li>
                </ul>
            </GuideSection>
        </>
    );

    const VietnameseContent = () => (
        <>
            <GuideSection title="1. Tổng quan" id="overview">
                <h3>Giới thiệu</h3>
                <p><strong>NebulaForge AI</strong> là một ứng dụng tự động hoàn toàn, không cần lộ mặt, được thiết kế để tối ưu hóa toàn bộ quy trình làm việc của một doanh nghiệp sáng tạo nội dung số. Hệ thống tận dụng sức mạnh của Google Gemini AI để tìm kiếm các sản phẩm kỹ thuật số đang thịnh hành, tạo kịch bản video hoàn chỉnh và các tài sản mạng xã hội, sản xuất video chất lượng cao và quản lý quy trình xuất bản. Mục tiêu chính là tạo ra một hệ thống có khả năng mở rộng để tạo thu nhập thụ động thông qua tiếp thị liên kết và doanh thu quảng cáo với sự can thiệp tối thiểu của con người.</p>
                <h3>Đối tượng mục tiêu</h3>
                <ul>
                    <li><strong>Người Sáng tạo Nội dung:</strong> Các cá nhân hoặc đội nhóm muốn tự động hóa việc sản xuất video cho các kênh đánh giá.</li>
                    <li><strong>Nhà Tiếp thị Liên kết:</strong> Các nhà tiếp thị muốn mở rộng quy mô chiến dịch bằng cách tự động hóa việc tạo nội dung cho nhiều sản phẩm khác nhau.</li>
                    <li><strong>Digital Agency:</strong> Các công ty cung cấp dịch vụ nội dung và marketing cho khách hàng và muốn nâng cao hiệu quả.</li>
                </ul>
                <h3>Lợi ích chính</h3>
                <ul>
                    <li><strong>Hiệu quả:</strong> Tự động hóa hơn 90% quy trình sáng tạo nội dung, từ lên ý tưởng đến kết xuất video cuối cùng.</li>
                    <li><strong>Khả năng mở rộng:</strong> Dễ dàng mở rộng quy mô sản xuất nội dung từ một video mỗi tuần lên hàng chục video mỗi ngày mà không cần tăng nỗ lực tương ứng.</li>
                    <li><strong>Thu nhập thụ động:</strong> Được thiết kế để chạy 24/7, liên tục tìm kiếm cơ hội và tạo nội dung để tạo ra doanh thu.</li>
                    <li><strong>Dựa trên dữ liệu:</strong> Sử dụng AI để xác định các sản phẩm có tiềm năng cao dựa trên hoa hồng liên kết và xu hướng thị trường.</li>
                </ul>
            </GuideSection>

            <GuideSection title="2. Kiến trúc hệ thống" id="architecture">
                <p>Hệ thống được xây dựng trên kiến trúc serverless hiện đại, đảm bảo khả năng mở rộng, bảo mật và khả năng bảo trì.</p>
                <h3>Thành phần cốt lõi</h3>
                <ul>
                    <li><strong>Frontend:</strong> Một Ứng dụng Trang đơn (SPA) được xây dựng bằng <strong>React</strong>, <strong>TypeScript</strong>, và giao diện với <strong>Tailwind CSS</strong>. Cung cấp một giao diện người dùng động và đáp ứng để quản lý toàn bộ hệ thống.</li>
                    <li><strong>Backend Proxy:</strong> Một serverless function được triển khai trên <strong>Vercel</strong> (<code>/api/proxy</code>) hoạt động như một backend an toàn. Nó xử lý tất cả các giao tiếp với Google AI API, đảm bảo rằng khóa API không bao giờ bị lộ ra phía client.</li>
                    <li><strong>Dịch vụ AI:</strong> Hệ thống độc quyền sử dụng <strong>Google Gemini API</strong> cho tất cả các tác vụ thông minh, bao gồm tạo văn bản (<code>gemini-2.5-flash</code>), tạo video (các model <code>veo-3.1</code>), và chuyển văn bản thành giọng nói (<code>gemini-2.5-flash-preview-tts</code>).</li>
                    <li><strong>Lưu trữ dữ liệu:</strong> Để đơn giản và dễ di chuyển trong phiên bản này, thông tin xác thực kết nối được lưu trong <strong>localStorage</strong> của trình duyệt. <strong>Lưu ý:</strong> Đối với môi trường production, việc chuyển dữ liệu nhạy cảm này sang một kho bảo mật phía backend (ví dụ: Vercel Environment Variables, Google Secret Manager) là cực kỳ quan trọng.</li>
                    <li><strong>Triển khai:</strong> Toàn bộ ứng dụng được triển khai và lưu trữ liền mạch trên <strong>Vercel</strong>, tận dụng pipeline CI/CD của nó để tự động build và triển khai từ một kho Git.</li>
                </ul>
                <h3>Sơ đồ kiến trúc (Mermaid)</h3>
                 <pre><code>{`
    graph TD
        A[Giao diện người dùng (React, Vite)] -->|Quản lý hệ thống| B(Vercel Hosting)
        A -->|Gọi API qua Proxy| C{/api/proxy (Vercel Serverless Function)}
        C -->|Gọi API an toàn| D[Google Gemini API]
        D -->|Tạo văn bản| E[gemini-2.5-flash]
        D -->|Tạo Video| F[Các model veo-3.1]
        D -->|Tổng hợp giọng nói| G[gemini-2.5-flash-preview-tts]
        A -->|Lưu/Đọc Credentials (Demo)| H(Browser localStorage)
                `}</code></pre>
            </GuideSection>

            <GuideSection title="3. Thành phần & Chức năng" id="features">
                <p>Ứng dụng được chia thành nhiều module, mỗi module xử lý một phần cụ thể của quy trình làm việc.</p>
                <table>
                    <thead>
                        <tr>
                            <th>Thành phần</th>
                            <th>Mô tả</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td><strong>Bảng Điều Khiển</strong></td><td>Cung cấp cái nhìn tổng quan về các chỉ số chính như doanh thu, chi phí và lợi nhuận. Hiển thị nhật ký hệ thống trực tiếp về hoạt động của các agent.</td></tr>
                        <tr><td><strong>Tự Động Hóa</strong></td><td>Trung tâm điều khiển cho tất cả các quy trình tự động. Người dùng có thể bật/tắt công tắc chính và cấu hình hành vi của các agent như Trinh Sát Sản Phẩm.</td></tr>
                        <tr><td><strong>Trinh Sát Sản Phẩm</strong></td><td>Một module được hỗ trợ bởi AI để khám phá các sản phẩm kỹ thuật số mới, đang thịnh hành. Nó phân tích tiềm năng lợi nhuận và thêm chúng vào hàng chờ để người dùng phê duyệt.</td></tr>
                        <tr><td><strong>Mẫu Prompt</strong></td><td>Cho phép tùy chỉnh hành vi của AI bằng cách chỉnh sửa các prompt cốt lõi được sử dụng để tạo nội dung, cho phép người dùng tinh chỉnh phong cách và giọng điệu của đầu ra.</td></tr>
                        <tr><td><strong>Tạo Nội Dung</strong></td><td>Nhận một sản phẩm đã được phê duyệt và sử dụng Gemini để tạo tất cả các tài sản văn bản cần thiết: kịch bản video, tiêu đề lan truyền, mô tả tối ưu SEO và phụ đề mạng xã hội.</td></tr>
                        <tr><td><strong>Studio</strong></td><td>Trung tâm sản xuất nâng cao. Cấu hình các model video, thêm hình ảnh tham chiếu, gán giọng nói cho kịch bản có nhiều người nói và tạo video cuối cùng.</td></tr>
                        <tr><td><strong>Hàng Chờ Kết Xuất</strong></td><td>Theo dõi tiến trình thời gian thực của tất cả các công việc kết xuất video. Cho phép người dùng theo dõi trạng thái và tải xuống các tệp video và âm thanh cuối cùng khi hoàn thành.</td></tr>
                        <tr><td><strong>Kết Nối</strong></td><td>Một trung tâm tập trung để quản lý thông tin xác thực cho các nền tảng khác nhau. Trong phiên bản hiện tại, dữ liệu này được lưu trữ cục bộ.</td></tr>
                        <tr><td><strong>Phân Tích</strong></td><td>Trực quan hóa dữ liệu hiệu suất, bao gồm lượt xem theo thời gian, doanh thu mỗi sản phẩm và phân tích chi tiết hiệu suất theo nền tảng. (Lưu ý: Dữ liệu hiện đang được giả lập).</td></tr>
                        <tr><td><strong>Tài Chính</strong></td><td>Theo dõi hiệu suất tài chính, bao gồm tổng doanh thu, chi phí, lợi nhuận ròng và ROI cho mỗi video được xuất bản. (Lưu ý: Dữ liệu hiện đang được giả lập).</td></tr>
                    </tbody>
                </table>
            </GuideSection>

            <GuideSection title="4. Luồng hoạt động" id="logicflow">
                <p>Hệ thống tuân theo một quy trình làm việc tuần tự, hợp lý từ khám phá sản phẩm đến xuất bản nội dung.</p>
                <ol>
                    <li><strong>Cấu hình:</strong> Người dùng trước tiên cấu hình hệ thống trong các tab <strong>Kết Nối</strong> và <strong>Tự Động Hóa</strong>. Điều này bao gồm thiết lập thông tin xác thực API và xác định các quy tắc tự động hóa (ví dụ: tần suất chạy của agent trinh sát).</li>
                    <li><strong>Trinh sát:</strong> Agent <strong>Trinh Sát Sản Phẩm</strong>, được kích hoạt thủ công hoặc bởi công cụ tự động hóa, gọi API Gemini với một chủ đề cụ thể. Gemini trả về một danh sách các sản phẩm tiềm năng. Hệ thống sau đó làm phong phú dữ liệu này với một "Điểm Cơ Hội".</li>
                    <li><strong>Phê duyệt:</strong> Các sản phẩm được tìm thấy bởi trinh sát được đặt trong hàng chờ. Người dùng có thể xem xét và phê duyệt chúng theo cách thủ công, hoặc công cụ tự động hóa có thể tự động phê duyệt các sản phẩm đáp ứng ngưỡng điểm được xác định trước.</li>
                    <li><strong>Tạo Nội dung:</strong> Khi một sản phẩm được phê duyệt, nó sẽ chuyển đến <strong>Trình tạo Nội dung</strong>. Tại đây, hệ thống sử dụng các prompt đã tùy chỉnh từ <strong>Mẫu Prompt</strong> để yêu cầu Gemini tạo kịch bản, tiêu đề, mô tả và phụ đề.</li>
                    <li><strong>Sản xuất Video:</strong> Người dùng điều hướng đến <strong>Studio</strong>, chọn sản phẩm với nội dung đã tạo, chọn model video/âm thanh và hình ảnh tham chiếu, rồi nhấp vào "Tạo Video". Thao tác này sẽ gửi một yêu cầu đến proxy backend, proxy này sẽ gọi API Gemini Veo và TTS. Một công việc mới xuất hiện trong <strong>Hàng Chờ Kết Xuất</strong>.</li>
                    <li><strong>Giám sát & Tải xuống:</strong> Hệ thống định kỳ thăm dò API Gemini để kiểm tra trạng thái của công việc kết xuất. Tiến trình được cập nhật trong giao diện người dùng. Sau khi hoàn thành, một liên kết tải xuống cho video MP4 sẽ khả dụng.</li>
                </ol>
                <h3>Sơ đồ quy trình (Mermaid)</h3>
                 <pre><code>{`
    graph LR
        subgraph "1. Cài đặt"
            A[Kết nối] --> B[Quy tắc tự động hóa]
        end
        subgraph "2. Khám phá"
            B --> C{Trinh sát sản phẩm} -->|Tìm sản phẩm| D[Hàng chờ phê duyệt]
        end
        subgraph "3. Sáng tạo nội dung"
            D -->|Phê duyệt| E[Tạo nội dung] -->|Tạo tài sản| F[Sẵn sàng sản xuất]
        end
        subgraph "4. Sản xuất video"
            F --> G[Studio] -->|Tạo công việc| H[Hàng chờ kết xuất]
        end
        subgraph "5. Hoàn thiện"
             H -->|Công việc hoàn tất| I[Tải video] --> J[Phân tích]
        end
                `}</code></pre>
            </GuideSection>

             <GuideSection title="5. Cài đặt & Triển khai" id="deployment">
                <h3>Yêu cầu tiên quyết</h3>
                <ul>
                    <li>Node.js (phiên bản 18 trở lên)</li>
                    <li>npm hoặc yarn</li>
                    <li>Tài khoản Vercel</li>
                    <li>Khóa API của Google AI Studio</li>
                </ul>
                <h3>Phát triển tại máy local</h3>
                <ol>
                    <li>Sao chép kho mã nguồn: <br/><code>git clone &lt;repository_url&gt;</code></li>
                    <li>Điều hướng đến thư mục dự án: <br/><code>cd nebulaforge-ai</code></li>
                    <li>Cài đặt các gói phụ thuộc: <br/><code>npm install</code></li>
                    <li>Tạo một tệp <code>.env.local</code> ở thư mục gốc.</li>
                    <li>Thêm khóa API Google AI Studio của bạn vào tệp: <br/><code>API_KEY="your_gemini_api_key_here"</code></li>
                    <li><strong>Trong một terminal khác</strong>, khởi động máy chủ proxy backend: <br/><code>node server.js</code></li>
                    <li>Trong terminal ban đầu của bạn, khởi động máy chủ phát triển: <br/><code>npm run dev</code></li>
                    <li>Ứng dụng sẽ có sẵn tại <code>http://localhost:5173</code> (hoặc một cổng khác nếu 5173 đang được sử dụng).</li>
                </ol>
                <h3>Triển khai lên Vercel</h3>
                <ol>
                    <li>Đẩy mã nguồn của bạn lên một kho Git (GitHub, GitLab, Bitbucket).</li>
                    <li>Đăng nhập vào tài khoản Vercel và tạo một dự án mới.</li>
                    <li>Nhập kho Git bạn vừa tạo.</li>
                    <li>Vercel sẽ tự động phát hiện framework Vite + React. Không cần thay đổi trong cài đặt build.</li>
                    <li>Điều hướng đến tab "Settings" của dự án và sau đó đến "Environment Variables".</li>
                    <li>Thêm một biến môi trường mới với khóa là <code>API_KEY</code> và dán khóa API Google AI Studio của bạn làm giá trị.</li>
                    <li>Nhấp vào "Deploy". Vercel sẽ build và triển khai ứng dụng của bạn. Sau vài phút, nó sẽ hoạt động trên một URL công khai.</li>
                </ol>
            </GuideSection>

            <GuideSection title="6. Hướng dẫn vận hành" id="operation">
                <h3>Bước 1: Cài đặt ban đầu</h3>
                <ul>
                    <li>Truy cập trang <strong>Kết Nối</strong>. Đối với phiên bản demo này, bạn không cần thêm bất kỳ thông tin xác thực nào ở đây vì chúng không được sử dụng để xuất bản. Tuy nhiên, trong phiên bản production, đây sẽ là bước đầu tiên.</li>
                    <li>Điều hướng đến trang <strong>Studio</strong>. Nếu bạn chưa chọn khóa API để tạo video, bạn sẽ được yêu cầu. Đây là một bước bắt buộc để sử dụng model Veo.</li>
                </ul>
                <h3>Bước 2: Cấu hình Tự động hóa</h3>
                <ul>
                    <li>Truy cập trang <strong>Tự Động Hóa</strong>. Bật "Công tắc Tự động hóa Chính" để cho phép các agent chạy.</li>
                    <li>Đặt "Tần suất Chạy" cho Agent Trinh sát và xác định "Chủ đề Mặc định" để nó tìm kiếm.</li>
                </ul>
                <h3>Bước 3: Tìm Sản phẩm</h3>
                <ul>
                    <li>Truy cập trang <strong>Trinh Sát Sản Phẩm</strong>.</li>
                    <li>Nhập một thị trường ngách (ví dụ: "công cụ năng suất AI") và nhấp vào "Tìm Sản Phẩm".</li>
                    <li>Xem lại các sản phẩm xuất hiện trong danh sách "Agent Chờ Phê Duyệt".</li>
                </ul>
                <h3>Bước 4: Tạo Nội dung</h3>
                <ul>
                    <li>Phê duyệt một sản phẩm từ danh sách trinh sát. Bạn sẽ tự động được chuyển đến trang <strong>Tạo Nội Dung</strong>.</li>
                    <li>Nhấp vào "Tạo Tất Cả". AI sẽ tạo kịch bản, tiêu đề, mô tả và phụ đề.</li>
                    <li>Xem lại văn bản đã tạo. Bạn có thể nhấp vào "Chỉnh sửa" trên bất kỳ phần nào để thay đổi. Chọn tiêu đề yêu thích của bạn từ danh sách.</li>
                </ul>
                <h3>Bước 5: Tạo Video</h3>
                <ul>
                    <li>Truy cập trang <strong>Studio</strong>. Sản phẩm bạn vừa xử lý sẽ được liệt kê.</li>
                    <li>Chọn Model Video và Giọng nói Âm thanh mong muốn từ các menu thả xuống.</li>
                    <li>(Tùy chọn) Tải lên tối đa 3 hình ảnh tham chiếu để hướng dẫn việc tạo video.</li>
                    <li>Nhấp vào "Tạo Video". Công việc sẽ được gửi đến <strong>Hàng Chờ Kết Xuất</strong>.</li>
                </ul>
                <h3>Bước 6: Theo dõi và Tải xuống</h3>
                <ul>
                    <li>Truy cập <strong>Hàng Chờ Kết Xuất</strong>. Bạn sẽ thấy công việc của mình với trạng thái "Đang kết xuất".</li>
                    <li>Thanh tiến trình sẽ cập nhật khi video được tạo. Quá trình này có thể mất vài phút.</li>
                    <li>Khi trạng thái chuyển thành "Hoàn thành", nút "Tải Video" sẽ được kích hoạt. Nhấp vào đó để lưu tệp MP4 của bạn.</li>
                </ul>
            </GuideSection>

            <GuideSection title="7. Đào tạo & tối ưu AI" id="aitraining">
                <h3>Hiểu về Prompt AI</h3>
                <p>Chất lượng và phong cách của nội dung do hệ thống tạo ra hoàn toàn phụ thuộc vào các prompt được cung cấp cho Gemini AI. "Đào tạo" AI trong bối cảnh này có nghĩa là tinh chỉnh các prompt này để tạo ra kết quả mong muốn. Hệ thống được thiết kế để làm cho quá trình này trở nên dễ dàng và dễ tiếp cận.</p>
                <h3>Tùy chỉnh Prompt</h3>
                <ol>
                    <li>Điều hướng đến trang <strong>Mẫu Prompt</strong>.</li>
                    <li>Bạn sẽ thấy một danh sách các mẫu mặc định cho các loại nội dung khác nhau (Kịch bản, Tiêu đề, v.v.).</li>
                    <li>Nhấp vào bất kỳ mẫu nào để tải nó vào trình chỉnh sửa ở bên phải.</li>
                    <li>Sửa đổi văn bản trong khu vực "Nội Dung Prompt". Bạn có thể thay đổi hướng dẫn, giọng điệu, cấu trúc hoặc thêm các yêu cầu mới.</li>
                    <li>Nhấp vào "Lưu Mẫu". Thay đổi của bạn sẽ được sử dụng cho tất cả các lần tạo nội dung thuộc loại đó trong tương lai.</li>
                </ul>
                <h3>Thực hành Kỹ thuật Prompt tốt nhất</h3>
                <ul>
                    <li><strong>Cụ thể:</strong> Thay vì "viết một kịch bản", hãy nói "Viết một kịch bản video ngắn gọn 60 giây để đánh giá trên YouTube Shorts". Hướng dẫn của bạn càng cụ thể, kết quả càng tốt.</li>
                    <li><strong>Sử dụng Placeholder:</strong> Hệ thống sử dụng các placeholder như <code>{`{{product_name}}`}</code> và <code>{`{{description}}`}</code> để chèn dữ liệu sản phẩm một cách linh hoạt vào prompt. Hãy đảm bảo bao gồm chúng ở những nơi thích hợp.</li>
                    <li><strong>Xác định Giọng điệu:</strong> Nêu rõ ràng giọng điệu mong muốn, ví dụ: "Giọng điệu: Năng động, đáng tin cậy và rõ ràng."</li>
                    <li><strong>Cung cấp Ví dụ (Few-shot Prompting):</strong> Trong prompt, hãy đưa ra các ví dụ về kết quả bạn muốn. Ví dụ, prompt "Tạo Tiêu đề Video" bao gồm các ví dụ như "AI này thật ĐIÊN RỒ!".</li>
                    <li><strong>Lặp lại và Thử nghiệm:</strong> Đừng ngại thử nghiệm. Nếu bạn không nhận được kết quả mong muốn, hãy điều chỉnh prompt và thử tạo lại nội dung. Những thay đổi nhỏ có thể tạo ra tác động lớn.</li>
                </ul>
            </GuideSection>

            <GuideSection title="8. Phân công nhiệm vụ" id="roles">
                 <p>Mặc dù một người có thể vận hành hệ thống, nó được thiết kế để hỗ trợ quy trình làm việc của một đội nhóm. Dưới đây là một số vai trò được đề xuất:</p>
                <table>
                    <thead>
                        <tr>
                            <th>Vai trò</th>
                            <th>Trách nhiệm</th>
                            <th>Module chính</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Chiến lược gia Nội dung</strong></td>
                            <td>Xác định các thị trường ngách mục tiêu, phân tích xu hướng thị trường và thiết lập chiến lược nội dung cấp cao. Cấu hình các quy tắc tự động hóa để phù hợp với mục tiêu.</td>
                            <td>Trinh sát Sản phẩm, Phân tích, Tự động hóa</td>
                        </tr>
                        <tr>
                            <td><strong>Quản lý Nội dung</strong></td>
                            <td>Xem xét và phê duyệt các sản phẩm do Agent Trinh sát tìm thấy. Chỉnh sửa và tinh chỉnh tất cả nội dung văn bản do AI tạo ra để đảm bảo chất lượng và phù hợp với thương hiệu. Quản lý và tối ưu hóa các mẫu prompt.</td>
                            <td>Trinh sát Sản phẩm, Tạo Nội dung, Mẫu Prompt</td>
                        </tr>
                        <tr>
                            <td><strong>Nhà sản xuất Video</strong></td>
                            <td>Quản lý quy trình sản xuất video. Chọn các model AI trong Studio, khởi tạo kết xuất và xử lý các tài sản video cuối cùng từ Hàng chờ kết xuất.</td>
                            <td>Studio, Hàng chờ kết xuất</td>
                        </tr>
                        <tr>
                            <td><strong>Quản trị viên Hệ thống</strong></td>
                            <td>Quản lý cấu hình hệ thống, bao gồm các khóa API và thông tin xác thực trong trung tâm Kết nối. Giám sát việc triển khai và theo dõi sức khỏe hệ thống.</td>
                            <td>Kết nối, Trạng thái Hệ thống</td>
                        </tr>
                    </tbody>
                </table>
            </GuideSection>
            
            <GuideSection title="9. Ưu & Nhược điểm" id="proscons">
                <h3>Ưu điểm (Thế mạnh)</h3>
                <ul>
                    <li><strong>Tự động hóa cao:</strong> Hệ thống tự động hóa các phần tốn thời gian nhất của việc tạo nội dung, từ nghiên cứu đến kết xuất cuối cùng.</li>
                    <li><strong>Quy trình làm việc toàn diện:</strong> Nó bao gồm toàn bộ quy trình trong một giao diện duy nhất, thống nhất.</li>
                    <li><strong>Tùy biến cực cao:</strong> Bản chất dựa trên prompt của AI cho phép tùy chỉnh sâu về phong cách, giọng điệu và định dạng nội dung.</li>
                    <li><strong>Khả năng mở rộng:</strong> Kiến trúc serverless và quy trình làm việc tự động cho phép mở rộng quy mô sản lượng nội dung một cách lớn.</li>
                    <li><strong>Công nghệ hiện đại:</strong> Được xây dựng bằng các công nghệ tiêu chuẩn ngành (React, TypeScript, Vercel) đảm bảo nó có thể bảo trì và mở rộng.</li>
                </ul>
                <h3>Nhược điểm (Điểm yếu & Hạn chế)</h3>
                <ul>
                    <li><strong>Phụ thuộc API:</strong> Hệ thống hoàn toàn phụ thuộc vào API Google Gemini. Bất kỳ thay đổi, thời gian chết hoặc chi phí nào liên quan đến API sẽ ảnh hưởng trực tiếp đến hệ thống.</li>
                    <li><strong>Lưu trữ thông tin xác thực không an toàn:</strong> Việc sử dụng <code>localStorage</code> cho các khóa API trong Trung tâm Kết nối là <strong>không an toàn cho việc sử dụng trong môi trường production</strong> và chỉ được triển khai cho mục đích trình diễn. Một kho bảo mật phía backend là cần thiết cho một ứng dụng thực tế.</li>
                    <li><strong>Dữ liệu giả lập:</strong> Dữ liệu xuất bản, phân tích và tài chính hiện đang được giả lập. Một triển khai thực tế sẽ yêu cầu tích hợp với API của các nền tảng (ví dụ: YouTube API) và API của các mạng liên kết để lấy dữ liệu thực.</li>
                    <li><strong>Thiếu cơ chế xuất bản thực sự:</strong> Bước cuối cùng là tự động tải video lên các nền tảng như YouTube chưa được triển khai. Đây là một tính năng quan trọng cần thiết để tự động hóa hoàn toàn.</li>
                </ul>
            </GuideSection>

            <GuideSection title="10. Phụ lục" id="appendix">
                <h3>Ngăn xếp Công nghệ</h3>
                <ul>
                    <li><strong>Frontend:</strong> React 18, Vite, TypeScript</li>
                    <li><strong>Styling:</strong> Tailwind CSS</li>
                    <li><strong>Animation:</strong> Framer Motion</li>
                    <li><strong>Đồ họa 3D:</strong> Three.js (cho nền sao)</li>
                    <li><strong>AI:</strong> Google Gemini API (@google/genai)</li>
                    <li><strong>Deployment:</strong> Vercel</li>
                </ul>
                <h3>Liên kết API & Tài liệu</h3>
                <ul>
                    <li><a href="https://ai.google.dev/gemini-api/docs" target="_blank" rel="noopener noreferrer">Tài liệu Google Gemini API</a></li>
                    <li><a href="https://ai.google.dev/gemini-api/docs/models/veo" target="_blank" rel="noopener noreferrer">Tài liệu Model Video Veo</a></li>
                    <li><a href="https://react.dev/" target="_blank" rel="noopener noreferrer">Tài liệu React</a></li>
                    <li><a href="https://vercel.com/docs" target="_blank" rel="noopener noreferrer">Tài liệu Vercel</a></li>
                </ul>
                <h3>Xử lý sự cố thường gặp</h3>
                <ul>
                    <li><strong>Tạo video thất bại với lỗi Khóa API:</strong> Đây là vấn đề phổ biến nhất. Hãy đến trang <strong>Studio</strong> và chọn lại khóa API Google AI của bạn. Đảm bảo khóa hợp lệ, đang hoạt động và đã bật thanh toán trên dự án Google Cloud liên quan.</li>
                    <li><strong>Ứng dụng không tải được:</strong> Xóa bộ nhớ cache và cookie của trình duyệt. Kiểm tra bảng điều khiển dành cho nhà phát triển của trình duyệt (F12) để tìm bất kỳ thông báo lỗi nào.</li>
                    <li><strong>Triển khai Vercel thất bại:</strong> Đảm bảo biến môi trường <code>API_KEY</code> được đặt chính xác trong cài đặt dự án Vercel của bạn. Kiểm tra nhật ký build trên Vercel để biết chi tiết lỗi cụ thể.</li>
                </ul>
            </GuideSection>
        </>
    );

    return (
        <div className="container mx-auto">
            <Card className="mb-8 text-center">
                <CardHeader>
                    <CardTitle className="text-3xl">{t('appGuide.title')}</CardTitle>
                    <CardDescription>{t('appGuide.description').replace('AI Video Automation System', t('appName'))}</CardDescription>
                </CardHeader>
            </Card>

            <div className="flex flex-col lg:flex-row gap-8">
                <aside className="lg:w-1/4 xl:w-1/5">
                    <div className="sticky top-24">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Table of Contents</CardTitle>
                            </CardHeader>
                            <nav className="p-2">
                                <ul className="space-y-1">
                                    {tocItems.map(item => (
                                        <li key={item.id}>
                                            <a 
                                                href={`#${item.id}`} 
                                                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
                                            >
                                                <span className="mr-3 text-primary-400">{item.icon}</span>
                                                {sectionTitles[item.key][locale]}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </Card>
                    </div>
                </aside>
                <main className="flex-1">
                    {locale === 'en' ? <EnglishContent /> : <VietnameseContent />}
                </main>
            </div>
        </div>
    );
};