import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from './components/common/Card';
import { useI18n } from '../contexts/I18nContext';
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
                    {/* FIX: Corrected corrupted line and completed the sentence. */}
                    <li><strong>Define the Tone:</strong> Explicitly state the desired tone, e.g., "friendly and trustworthy" or "professional and academic". This guides the AI's writing style.</li>
                </ul>
            </GuideSection>
            
            <GuideSection title="8. Team & Roles" id="roles">
                <h3>Team Structure</h3>
                <p>While one person can operate this system, an optimal team structure for scaling would be:</p>
                <ul>
                    <li><strong>Strategist/Manager (Part-Time):</strong> Oversees the entire operation. Monitors analytics, adjusts automation rules, researches new, high-level niches, and manages prompt templates.</li>
                    <li><strong>QA/Publisher (Part-Time):</strong> Performs a final quality check on generated content and videos. Uploads the final assets to social media platforms and schedules posts. This role becomes more important as output volume increases.</li>
                </ul>
                <p>The AI handles the roles of researcher, copywriter, and video editor.</p>
            </GuideSection>
            
            <GuideSection title="9. Pros & Cons" id="proscons">
                <h3>Pros</h3>
                <ul>
                    <li><strong>Extreme Automation:</strong> Reduces manual work significantly.</li>
                    <li><strong>High Scalability:</strong> Easy to increase content output.</li>
                    <li><strong>Low Operational Cost:</strong> Main costs are API usage and hosting, which are variable and scale with output.</li>
                    <li><strong>Adaptable:</strong> Prompts can be easily updated to change content style or adapt to new trends.</li>
                </ul>
                <h3>Cons</h3>
                <ul>
                    <li><strong>Dependency on APIs:</strong> The system is reliant on the availability and pricing of the Google Gemini API.</li>
                    <li><strong>Potential for Generic Content:</strong> Without well-crafted prompts, the AI might produce repetitive or generic content. The <strong>Prompt Templates</strong> feature is designed to mitigate this.</li>
                    <li><strong>Initial Setup Complexity:</strong> Requires technical knowledge to deploy and configure API credentials securely.</li>
                    <li><strong>Quality Control:</strong> A human review is still recommended before publishing to catch any AI errors or awkward phrasing.</li>
                </ul>
            </GuideSection>

            <GuideSection title="10. Appendix" id="appendix">
                <h3>Glossary</h3>
                <ul>
                    <li><strong>SPA:</strong> Single Page Application. A web app that loads a single HTML page and dynamically updates content.</li>
                    <li><strong>Vercel:</strong> A cloud platform for serverless functions and hosting frontend web applications.</li>
                    <li><strong>Proxy Server:</strong> An intermediary server that forwards requests from a client to other servers. Used here to protect the API key.</li>
                    <li><strong>localStorage:</strong> A web storage mechanism that allows websites to store data in a user's browser with no expiration date.</li>
                </ul>
            </GuideSection>
        </>
    );

    const VietnameseContent = () => (
        <>
            <GuideSection title="1. Tổng quan" id="overview">
                <h3>Giới thiệu</h3>
                <p><strong>NebulaForge AI</strong> là một ứng dụng toàn diện, không cần lộ mặt, hoàn toàn tự động được thiết kế để tối ưu hóa toàn bộ quy trình làm việc của một doanh nghiệp sáng tạo nội dung số. Nó tận dụng sức mạnh của Google Gemini AI để tìm kiếm các sản phẩm kỹ thuật số đang thịnh hành, tạo kịch bản video hoàn chỉnh và các tài sản mạng xã hội, sản xuất video chất lượng cao và quản lý quy trình xuất bản. Mục tiêu chính là tạo ra một hệ thống có thể mở rộng để tạo thu nhập thụ động thông qua tiếp thị liên kết và doanh thu quảng cáo với sự can thiệp tối thiểu của con người.</p>
                <h3>Đối tượng mục tiêu</h3>
                <ul>
                    <li><strong>Nhà sáng tạo nội dung:</strong> Các cá nhân hoặc nhóm muốn tự động hóa việc sản xuất video cho các kênh đánh giá.</li>
                    <li><strong>Nhà tiếp thị liên kết:</strong> Các nhà tiếp thị muốn mở rộng quy mô chiến dịch bằng cách tự động hóa việc tạo nội dung cho các sản phẩm khác nhau.</li>
                    <li><strong>Các công ty kỹ thuật số:</strong> Các công ty cung cấp dịch vụ nội dung và tiếp thị cho khách hàng và muốn cải thiện hiệu quả.</li>
                </ul>
                <h3>Lợi ích chính</h3>
                <ul>
                    <li><strong>Hiệu quả:</strong> Tự động hóa hơn 90% quy trình tạo nội dung, từ lên ý tưởng đến kết xuất video cuối cùng.</li>
                    <li><strong>Khả năng mở rộng:</strong> Dễ dàng mở rộng quy mô sản xuất nội dung từ một video mỗi tuần lên hàng chục video mỗi ngày mà không cần tăng nỗ lực tương ứng.</li>
                    <li><strong>Thu nhập thụ động:</strong> Được thiết kế để chạy 24/7, liên tục tìm kiếm cơ hội và tạo nội dung để tạo doanh thu.</li>
                    <li><strong>Dựa trên dữ liệu:</strong> Sử dụng AI để xác định các sản phẩm có tiềm năng cao dựa trên hoa hồng liên kết và xu hướng thị trường.</li>
                </ul>
            </GuideSection>
            
            <GuideSection title="2. Kiến trúc hệ thống" id="architecture">
                <p>Hệ thống được xây dựng trên kiến trúc serverless hiện đại, đảm bảo khả năng mở rộng, bảo mật và khả năng bảo trì.</p>
                <h3>Các thành phần cốt lõi</h3>
                <ul>
                    <li><strong>Frontend:</strong> Một Ứng dụng Trang đơn (SPA) được xây dựng bằng <strong>React</strong>, <strong>TypeScript</strong> và tạo kiểu bằng <strong>Tailwind CSS</strong>. Nó cung cấp một giao diện người dùng động và đáp ứng để quản lý toàn bộ hệ thống.</li>
                    <li><strong>Backend Proxy:</strong> Một hàm serverless được triển khai trên <strong>Vercel</strong> (<code>/api/proxy</code>) hoạt động như một backend an toàn. Nó xử lý tất cả các giao tiếp với Google AI API, đảm bảo rằng khóa API không bao giờ bị lộ ra phía client.</li>
                    <li><strong>Dịch vụ AI:</strong> Hệ thống chỉ sử dụng <strong>Google Gemini API</strong> cho tất cả các tác vụ thông minh, bao gồm tạo văn bản (<code>gemini-2.5-flash</code>), tạo video (các mô hình <code>veo-3.1</code>), và chuyển văn bản thành giọng nói (<code>gemini-2.5-flash-preview-tts</code>).</li>
                    <li><strong>Lưu trữ dữ liệu:</strong> Để đơn giản và dễ di chuyển trong phiên bản này, thông tin xác thực kết nối được lưu trong <strong>localStorage</strong> của trình duyệt. <strong>Lưu ý:</strong> Đối với môi trường production, rất quan trọng phải chuyển dữ liệu nhạy cảm này sang một kho bảo mật ở backend (ví dụ: Vercel Environment Variables, Google Secret Manager).</li>
                    <li><strong>Triển khai:</strong> Toàn bộ ứng dụng được triển khai và lưu trữ liền mạch trên <strong>Vercel</strong>, tận dụng quy trình CI/CD của nó để tự động xây dựng và triển khai từ một kho lưu trữ Git.</li>
                </ul>
                <h3>Sơ đồ kiến trúc (Mermaid)</h3>
                <pre><code>{`
    graph TD
        A[Giao diện người dùng (React, Vite)] -->|Quản lý hệ thống| B(Vercel Hosting)
        A -->|Gọi API qua Proxy| C{/api/proxy (Vercel Serverless Function)}
        C -->|Gọi API an toàn| D[Google Gemini API]
        D -->|Tạo văn bản| E[gemini-2.5-flash]
        D -->|Tạo Video| F[Các mô hình veo-3.1]
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
                        <tr><td><strong>Bảng điều khiển</strong></td><td>Cung cấp cái nhìn tổng quan về các chỉ số chính như doanh thu, chi phí và lợi nhuận. Hiển thị nhật ký hệ thống trực tiếp về các hoạt động của agent.</td></tr>
                        <tr><td><strong>Tự động hóa</strong></td><td>Trung tâm điều khiển cho tất cả các quy trình tự động. Người dùng có thể bật/tắt công tắc chính và cấu hình hành vi của các agent như Trinh sát Sản phẩm.</td></tr>
                        <tr><td><strong>Trinh sát Sản phẩm</strong></td><td>Một module được hỗ trợ bởi AI để khám phá các sản phẩm kỹ thuật số mới, đang thịnh hành. Nó phân tích tiềm năng lợi nhuận của chúng và thêm chúng vào hàng đợi để người dùng phê duyệt.</td></tr>
                        <tr><td><strong>Mẫu Prompt</strong></td><td>Cho phép tùy chỉnh hành vi của AI bằng cách chỉnh sửa các prompt cốt lõi được sử dụng để tạo nội dung, cho phép người dùng tinh chỉnh phong cách và giọng điệu của đầu ra.</td></tr>
                        <tr><td><strong>Tạo Nội dung</strong></td><td>Lấy một sản phẩm đã được phê duyệt và sử dụng Gemini để tạo tất cả các tài sản văn bản cần thiết: kịch bản video, tiêu đề lan truyền, mô tả tối ưu hóa SEO và phụ đề mạng xã hội.</td></tr>
                        <tr><td><strong>Studio</strong></td><td>Trung tâm sản xuất nâng cao. Cấu hình các mô hình video, thêm hình ảnh tham chiếu, gán giọng nói cho kịch bản có nhiều người nói và tạo video cuối cùng.</td></tr>
                        <tr><td><strong>Hàng chờ Kết xuất</strong></td><td>Theo dõi tiến trình thời gian thực của tất cả các công việc kết xuất video. Cho phép người dùng theo dõi trạng thái và tải xuống các tệp video và âm thanh cuối cùng sau khi hoàn thành.</td></tr>
                        <tr><td><strong>Kết nối</strong></td><td>Một trung tâm tập trung để quản lý thông tin xác thực cho các nền tảng khác nhau. Trong phiên bản hiện tại, dữ liệu này được lưu trữ cục bộ.</td></tr>
                        <tr><td><strong>Phân tích</strong></td><td>Hiển thị dữ liệu hiệu suất, bao gồm lượt xem theo thời gian, doanh thu mỗi sản phẩm và phân tích hiệu suất theo nền tảng. (Lưu ý: Dữ liệu hiện đang được giả lập).</td></tr>
                        <tr><td><strong>Tài chính</strong></td><td>Theo dõi hiệu suất tài chính, bao gồm tổng doanh thu, chi phí, lợi nhuận ròng và ROI cho mỗi video được xuất bản. (Lưu ý: Dữ liệu hiện đang được giả lập).</td></tr>
                    </tbody>
                </table>
            </GuideSection>
            
            <GuideSection title="4. Luồng hoạt động" id="logicflow">
                <p>Hệ thống tuân theo một quy trình làm việc logic, tuần tự từ khám phá sản phẩm đến xuất bản nội dung.</p>
                <ol>
                    <li><strong>Cấu hình:</strong> Người dùng đầu tiên cấu hình hệ thống trong các tab <strong>Kết nối</strong> và <strong>Tự động hóa</strong>. Điều này bao gồm việc thiết lập thông tin xác thực API và xác định các quy tắc tự động hóa (ví dụ: tần suất chạy của agent trinh sát).</li>
                    <li><strong>Trinh sát:</strong> Agent <strong>Trinh sát Sản phẩm</strong>, được kích hoạt thủ công hoặc bởi công cụ tự động hóa, gọi Gemini API với một chủ đề cụ thể. Gemini trả về một danh sách các sản phẩm tiềm năng. Hệ thống sau đó làm phong phú dữ liệu này bằng một "Điểm Cơ hội".</li>
                    <li><strong>Phê duyệt:</strong> Các sản phẩm được tìm thấy bởi trinh sát được đặt trong một hàng đợi chờ xử lý. Người dùng có thể xem xét và phê duyệt thủ công, hoặc công cụ tự động hóa có thể tự động phê duyệt các sản phẩm đáp ứng một ngưỡng điểm được xác định trước.</li>
                    <li><strong>Tạo Nội dung:</strong> Khi một sản phẩm được phê duyệt, nó sẽ chuyển đến <strong>Trình tạo Nội dung</strong>. Tại đây, hệ thống sử dụng các prompt tùy chỉnh từ <strong>Mẫu Prompt</strong> để yêu cầu Gemini tạo kịch bản, tiêu đề, mô tả và phụ đề.</li>
                    <li><strong>Sản xuất Video:</strong> Người dùng điều hướng đến <strong>Studio</strong>, chọn sản phẩm với nội dung đã tạo, chọn mô hình video/âm thanh và hình ảnh tham chiếu, và nhấp vào "Tạo Video". Thao tác này sẽ gửi một yêu cầu đến backend proxy, backend này sẽ gọi Gemini Veo và TTS API. Một công việc mới xuất hiện trong <strong>Hàng chờ Kết xuất</strong>.</li>
                    <li><strong>Theo dõi & Tải xuống:</strong> Hệ thống định kỳ thăm dò Gemini API để kiểm tra trạng thái của công việc kết xuất. Tiến trình được cập nhật trong giao diện người dùng. Sau khi hoàn thành, một liên kết tải xuống cho video MP4 sẽ khả dụng.</li>
                </ol>
                <h3>Sơ đồ quy trình (Mermaid)</h3>
                <pre><code>{`
    graph LR
        subgraph "1. Thiết lập"
            A[Kết nối] --> B[Quy tắc tự động hóa]
        end
        subgraph "2. Khám phá"
            B --> C{Trinh sát Sản phẩm} -->|Tìm sản phẩm| D[Hàng đợi chờ]
        end
        subgraph "3. Tạo Nội dung"
            D -->|Phê duyệt| E[Trình tạo Nội dung] -->|Tạo tài sản| F[Sẵn sàng sản xuất]
        end
        subgraph "4. Sản xuất Video"
            F --> G[Studio] -->|Tạo công việc| H[Hàng chờ Kết xuất]
        end
        subgraph "5. Hoàn thiện"
             H -->|Công việc hoàn tất| I[Tải Video] --> J[Phân tích]
        end
                `}</code></pre>
            </GuideSection>
            
            <GuideSection title="5. Cài đặt & Triển khai" id="deployment">
                <h3>Yêu cầu</h3>
                <ul>
                    <li>Node.js (v18 trở lên)</li>
                    <li>npm hoặc yarn</li>
                    <li>Tài khoản Vercel</li>
                    <li>Khóa API Google AI Studio</li>
                </ul>
                <h3>Phát triển tại máy</h3>
                <ol>
                    <li>Sao chép kho lưu trữ: <br/><code>git clone &lt;repository_url&gt;</code></li>
                    <li>Điều hướng đến thư mục dự án: <br/><code>cd nebulaforge-ai</code></li>
                    <li>Cài đặt các phụ thuộc: <br/><code>npm install</code></li>
                    <li>Tạo tệp <code>.env.local</code> trong thư mục gốc.</li>
                    <li>Thêm khóa API Google AI Studio của bạn vào tệp: <br/><code>API_KEY="your_gemini_api_key_here"</code></li>
                    <li><strong>Trong một terminal riêng</strong>, khởi động máy chủ proxy backend: <br/><code>node server.js</code></li>
                    <li>Trong terminal ban đầu của bạn, khởi động máy chủ phát triển: <br/><code>npm run dev</code></li>
                    <li>Ứng dụng sẽ có sẵn tại <code>http://localhost:5173</code> (hoặc một cổng khác nếu 5173 đang được sử dụng).</li>
                </ul>
                <h3>Triển khai lên Vercel</h3>
                <ol>
                    <li>Đẩy mã của bạn lên một kho lưu trữ Git (GitHub, GitLab, Bitbucket).</li>
                    <li>Đăng nhập vào tài khoản Vercel của bạn và tạo một dự án mới.</li>
                    <li>Nhập kho lưu trữ Git bạn vừa tạo.</li>
                    <li>Vercel sẽ tự động phát hiện framework Vite + React. Không cần thay đổi trong cài đặt xây dựng.</li>
                    <li>Điều hướng đến tab "Settings" của dự án và sau đó đến "Environment Variables".</li>
                    <li>Thêm một biến môi trường mới với khóa <code>API_KEY</code> và dán khóa API Google AI Studio của bạn làm giá trị.</li>
                    <li>Nhấp vào "Deploy". Vercel sẽ xây dựng và triển khai ứng dụng của bạn. Sau vài phút, nó sẽ hoạt động trên một URL công khai.</li>
                </ol>
            </GuideSection>
            
            <GuideSection title="6. Hướng dẫn vận hành" id="operation">
                <h3>Bước 1: Cài đặt ban đầu</h3>
                <ul>
                    <li>Đi đến trang <strong>Kết nối</strong>. Đối với phiên bản demo này, bạn không cần thêm bất kỳ thông tin xác thực nào ở đây vì chúng không được sử dụng để xuất bản. Tuy nhiên, trong phiên bản production, đây sẽ là bước đầu tiên.</li>
                    <li>Điều hướng đến trang <strong>Studio</strong>. Nếu bạn chưa chọn khóa API để tạo video, bạn sẽ được nhắc nhở. Đây là một bước bắt buộc để sử dụng mô hình Veo.</li>
                </ul>
                <h3>Bước 2: Cấu hình Tự động hóa</h3>
                <ul>
                    <li>Truy cập trang <strong>Tự động hóa</strong>. Bật "Công tắc Tự động hóa Chính" để cho phép các agent chạy.</li>
                    <li>Đặt "Tần suất Chạy" cho Agent Trinh sát và xác định một "Chủ đề Mặc định" để nó tìm kiếm.</li>
                </ul>
                <h3>Bước 3: Tìm Sản phẩm</h3>
                <ul>
                    <li>Đi đến trang <strong>Trinh sát Sản phẩm</strong>.</li>
                    <li>Nhập một thị trường ngách (ví dụ: "công cụ năng suất AI") và nhấp vào "Tìm Sản phẩm".</li>
                    <li>Xem lại các sản phẩm xuất hiện trong danh sách "Agent Chờ Phê duyệt".</li>
                </ul>
                <h3>Bước 4: Tạo Nội dung</h3>
                <ul>
                    <li>Phê duyệt một sản phẩm từ danh sách trinh sát. Bạn sẽ được tự động đưa đến trang <strong>Trình tạo Nội dung</strong>.</li>
                    <li>Nhấp vào "Tạo Tất cả Tài sản". AI sẽ tạo kịch bản, tiêu đề, mô tả và phụ đề.</li>
                    <li>Xem lại văn bản đã tạo. Bạn có thể nhấp vào "Chỉnh sửa" trên bất kỳ phần nào để thay đổi. Chọn tiêu đề yêu thích của bạn từ danh sách.</li>
                </ul>
                <h3>Bước 5: Tạo Video</h3>
                <ul>
                    <li>Đi đến trang <strong>Studio</strong>. Sản phẩm bạn vừa xử lý sẽ được liệt kê.</li>
                    <li>Chọn Mô hình Video và Giọng nói mong muốn từ các menu thả xuống.</li>
                    <li>(Tùy chọn) Tải lên tối đa 3 hình ảnh tham chiếu để hướng dẫn việc tạo video.</li>
                    <li>Nhấp vào "Tạo Video". Công việc sẽ được gửi đến <strong>Hàng chờ Kết xuất</strong>.</li>
                </ul>
                <h3>Bước 6: Theo dõi và Tải xuống</h3>
                <ul>
                    <li>Đi đến <strong>Hàng chờ Kết xuất</strong>. Bạn sẽ thấy công việc của mình với trạng thái "Đang kết xuất".</li>
                    <li>Thanh tiến trình sẽ cập nhật khi video được tạo. Quá trình này có thể mất vài phút.</li>
                    <li>Khi trạng thái thay đổi thành "Hoàn thành", nút "Tải Video" sẽ được kích hoạt. Nhấp vào đó để lưu tệp MP4 của bạn.</li>
                </ul>
            </GuideSection>
            
            <GuideSection title="7. Đào tạo & tối ưu AI" id="aitraining">
                <h3>Hiểu về Prompt AI</h3>
                <p>Chất lượng và phong cách của nội dung được tạo ra bởi hệ thống hoàn toàn phụ thuộc vào các prompt được cung cấp cho Gemini AI. "Đào tạo" AI trong bối cảnh này có nghĩa là tinh chỉnh các prompt này để tạo ra kết quả mong muốn. Hệ thống được thiết kế để làm cho quá trình này dễ dàng và dễ tiếp cận.</p>
                <h3>Tùy chỉnh Prompt</h3>
                <ol>
                    <li>Điều hướng đến trang <strong>Mẫu Prompt</strong>.</li>
                    <li>Bạn sẽ thấy một danh sách các mẫu mặc định cho các loại nội dung khác nhau (Kịch bản, Tiêu đề, v.v.).</li>
                    <li>Nhấp vào bất kỳ mẫu nào để tải nó vào trình chỉnh sửa ở bên phải.</li>
                    <li>Sửa đổi văn bản trong khu vực "Nội dung Prompt". Bạn có thể thay đổi hướng dẫn, giọng điệu, cấu trúc hoặc thêm các yêu cầu mới.</li>
                    <li>Nhấp vào "Lưu Mẫu". Các thay đổi của bạn sẽ được sử dụng cho tất cả các lần tạo nội dung tương lai của loại đó.</li>
                </ul>
                <h3>Phương pháp hay nhất về Kỹ thuật Prompt</h3>
                <ul>
                    <li><strong>Cụ thể:</strong> Thay vì "viết một kịch bản", hãy nói "Viết một kịch bản video ngắn gọn 60 giây để đánh giá trên YouTube Shorts". Hướng dẫn của bạn càng cụ thể, kết quả càng tốt.</li>
                    <li><strong>Sử dụng Placeholder:</strong> Hệ thống sử dụng các placeholder như <code>{`{{product_name}}`}</code> và <code>{`{{description}}`}</code> để chèn dữ liệu sản phẩm một cách linh hoạt vào prompt. Hãy chắc chắn bao gồm chúng ở những nơi có liên quan.</li>
                    <li><strong>Xác định Giọng điệu:</strong> Nêu rõ giọng điệu mong muốn, ví dụ: "thân thiện và đáng tin cậy" hoặc "chuyên nghiệp và học thuật". Điều này hướng dẫn phong cách viết của AI.</li>
                </ul>
            </GuideSection>
            
            <GuideSection title="8. Phân công nhiệm vụ" id="roles">
                <h3>Cấu trúc nhóm</h3>
                <p>Mặc dù một người có thể vận hành hệ thống này, một cấu trúc nhóm tối ưu để mở rộng quy mô sẽ là:</p>
                <ul>
                    <li><strong>Chiến lược gia/Quản lý (Bán thời gian):</strong> Giám sát toàn bộ hoạt động. Theo dõi phân tích, điều chỉnh các quy tắc tự động hóa, nghiên cứu các thị trường ngách cấp cao mới và quản lý các mẫu prompt.</li>
                    <li><strong>QA/Nhà xuất bản (Bán thời gian):</strong> Thực hiện kiểm tra chất lượng cuối cùng đối với nội dung và video đã tạo. Tải lên các tài sản cuối cùng lên các nền tảng mạng xã hội và lên lịch đăng bài. Vai trò này trở nên quan trọng hơn khi khối lượng đầu ra tăng lên.</li>
                </ul>
                <p>AI xử lý các vai trò của nhà nghiên cứu, người viết quảng cáo và biên tập viên video.</p>
            </GuideSection>
            
            <GuideSection title="9. Ưu & Nhược điểm" id="proscons">
                <h3>Ưu điểm</h3>
                <ul>
                    <li><strong>Tự động hóa cực cao:</strong> Giảm đáng kể công việc thủ công.</li>
                    <li><strong>Khả năng mở rộng cao:</strong> Dễ dàng tăng sản lượng nội dung.</li>
                    <li><strong>Chi phí vận hành thấp:</strong> Chi phí chính là việc sử dụng API và lưu trữ, có thể thay đổi và mở rộng theo sản lượng.</li>
                    <li><strong>Khả năng thích ứng:</strong> Các prompt có thể được cập nhật dễ dàng để thay đổi phong cách nội dung hoặc thích ứng với các xu hướng mới.</li>
                </ul>
                <h3>Nhược điểm</h3>
                <ul>
                    <li><strong>Phụ thuộc vào API:</strong> Hệ thống phụ thuộc vào sự sẵn có và giá cả của Google Gemini API.</li>
                    <li><strong>Nguy cơ nội dung chung chung:</strong> Nếu không có các prompt được soạn thảo kỹ lưỡng, AI có thể tạo ra nội dung lặp đi lặp lại hoặc chung chung. Tính năng <strong>Mẫu Prompt</strong> được thiết kế để giảm thiểu điều này.</li>
                    <li><strong>Độ phức tạp khi cài đặt ban đầu:</strong> Yêu cầu kiến thức kỹ thuật để triển khai và cấu hình thông tin xác thực API một cách an toàn.</li>
                    <li><strong>Kiểm soát chất lượng:</strong> Vẫn nên có sự xem xét của con người trước khi xuất bản để phát hiện bất kỳ lỗi nào của AI hoặc cách diễn đạt khó xử.</li>
                </ul>
            </GuideSection>

            <GuideSection title="10. Phụ lục" id="appendix">
                <h3>Thuật ngữ</h3>
                <ul>
                    <li><strong>SPA:</strong> Ứng dụng Trang đơn. Một ứng dụng web tải một trang HTML duy nhất và cập nhật nội dung một cách linh hoạt.</li>
                    <li><strong>Vercel:</strong> Một nền tảng đám mây cho các hàm serverless và lưu trữ các ứng dụng web frontend.</li>
                    <li><strong>Máy chủ Proxy:</strong> Một máy chủ trung gian chuyển tiếp các yêu cầu từ một client đến các máy chủ khác. Được sử dụng ở đây để bảo vệ khóa API.</li>
                    <li><strong>localStorage:</strong> Một cơ chế lưu trữ web cho phép các trang web lưu trữ dữ liệu trong trình duyệt của người dùng mà không có ngày hết hạn.</li>
                </ul>
            </GuideSection>
        </>
    );

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-1/4 xl:w-1/5 lg:sticky lg:top-24 h-fit">
                <div className="p-4 space-y-2 glass-card rounded-lg">
                    <h3 className="font-semibold text-gray-200">{t('appGuide.title')}</h3>
                    <ul>
                        {tocItems.map(item => (
                            <li key={item.id}>
                                <a href={`#${item.id}`} className="flex items-center space-x-2 text-sm text-gray-400 hover:text-primary-300 py-1.5 rounded-md">
                                    {item.icon}
                                    <span>{sectionTitles[item.key][locale as 'en' | 'vi']}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
            <main className="flex-1">
                {locale === 'en' ? <EnglishContent /> : <VietnameseContent />}
            </main>
        </div>
    );
};
