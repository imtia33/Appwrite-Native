# Contributing to Appwrite - The Native Console

First off, thank you for considering contributing to Appwrite - The Native Console! It's people like you that make the Appwrite community such a great place. Even if you dont know much react native, you can still help us by reporting issues, suggesting features, or contributing to the codebase. Still you can work directly because its not any different from a react project.

## 📁 Project Structure

Understanding the project structure is the first step to contributing. This project is built with **Expo** and **React Native**, leveraging **NativeWind** for styling and **RN Primitives** for UI components.

```text
AppwriteNative/
├── app/                  # Expo Router directory (File-based routing)
│   ├── (auth)/           # Authentication screens (Login, Sign-up)
│   ├── (tabs)/           # Main tab navigation (Overview, Databases, Functions, etc.)
│   ├── _layout.tsx       # Root layout configuration
│   └── index.tsx         # Entry point / Redirect logic
├── appwrite/             # Appwrite configuration and services
│   ├── services/         # Modular service wrappers for Appwrite SDK
│   └── client.ts         # Initialized Appwrite client
├── assets/               # Static assets (Images, Icons, Fonts)
├── components/           # Reusable React Native components
│   ├── ui/               # Base UI primitives (Buttons, Inputs, Cards, etc.)
│   └── project/          # Project-specific feature components
├── context/              # React Context providers (Auth, Theme)
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and shared constants
├── constants/            # Global constants and theme definitions
└── mockup/               # Design mockups and reference images
```

## 🛠️ How to Contribute

### 1. Find or Create an Issue

Before you start coding, please search for an existing issue or create a new one to discuss the feature or bug you're interested in.

### 2. Fork and Branch

- Fork the repository to your own account.
- Create a feature branch from `main`: `git checkout -b feature/your-feature-name`.

### 3. Development Environment

Ensure you have the following installed:

- Node.js (v18+)
- npm or yarn
- Expo Go app on your phone (for testing)

### 4. Code Principles

- **Clean Code**: Follow React Native best practices.
- **Styling**: Use **NativeWind** (Tailwind CSS) for all styling. Avoid inline styles where possible.
- **Components**: Use existing components from `components/ui` or follow the same pattern using `@rn-primitives`.
- **Typing**: This project strictly uses **TypeScript**. Ensure all new code is properly typed.

### 5. Manual Testing

I currently rely heavily on manual testing via Expo Go or EAS builds.

#### Testing with Expo Go

1. Start the development server: `npm start`.
2. Open the Expo Go app and scan the QR code.
3. Verify your changes across different screens and interactions.

#### Testing with EAS Preview (Recommended for Native Features)

If your changes involve native modules or complex UI:

```bash
eas build --profile preview
```

### 6. Submit a Pull Request

- Ensure your code follows the project's linting rules.
- Push your changes to your fork.
- Open a Pull Request against the `main` branch.
- Provide a clear description of what your PR does and include screenshots or recordings if it involves UI changes.

## 📋 Contribution Ideas

- **Implementing Service Screens**: Many Appwrite services currently have shell screens. Help me implement the full functionality!
- **UI/UX Improvements**: Enhance the mobile experience with better animations and layouts.
- **Performance Optimization**: help me make the console feel even snappier.
- **Documentation**: Improve this guide or the main README.

---

## 🙏 Acknowledgments

A huge thank you to the [Appwrite](https://appwrite.io/) team for creating such a fantastic platform and providing the inspiration (and the original web console) for this project.

**Let's build the best native console for Appwrite together!**
