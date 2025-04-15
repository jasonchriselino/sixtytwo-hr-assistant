# Sixty Two HR Assistant

An AI-powered HR assistant that helps team members understand company policies and benefits by answering questions based on the official Sixty Two handbook.

## Features

- 🤖 AI-powered responses using OpenAI
- 📚 Comprehensive handbook integration
- 💬 Real-time chat interface
- 🎨 Beautiful UI with Tailwind CSS
- ⚡ Built with Vite and React
- 🚀 Serverless functions with Netlify

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 7 or higher
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sixtytwo-hr-assistant.git
   cd sixtytwo-hr-assistant
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

4. Add your OpenAI API key to the `.env` file:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

### Development

Start the development server:

```bash
npm run dev
```

### Building for Production

Build the project:

```bash
npm run build
```

### Deployment

The project is configured for deployment on Netlify. Connect your GitHub repository to Netlify and it will automatically deploy your changes.

## License

MIT