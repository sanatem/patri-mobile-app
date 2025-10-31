# Patriomore App Development Guide


## Project Technologies
- **React Native 0.79.5** with Expo SDK 54
- **TypeScript** with strict mode enabled
- **Expo Router** for navigation
- **NativeWind** (Tailwind CSS for React Native)
- **Zustand** for global state management
- **React Hook Form** for forms
- **Auth0** for authentication
- **OpenAI** for AI functionalities
- **i18next** for internationalization
- **D3** for charts and visualizations
- **AsyncStorage** for data persistence
- **React Native Purchases** for monetization

## Project Structure

### Organized by Features
```
app/ - Screens and layouts (Expo Router)
components/ - Organized by feature
  budget/ - Components related to the budget
  copilot/ - Components of the AI chat
  icons/ - Custom icons
  investment/ - Components related to investments
  navigation/ - Navigation components
  patrimony/ - Components related to patrimony
  planning/ - Components related to planning
  ui/ - Reusable UI components
hooks/ - Custom hooks organized by feature
services/ - API services organized by feature
providers/ - Context providers
constants/ - Constants organized by category
types/ - Definitions of types
locales/ - Translation files
styles/ - Specific styles by feature
```

### Code Conventions

**IMPORTANT: As an AI Agent, you will NEVER attempt to run this application using `npm run dev` or any other run command. You will NEVER attempt to start or build Storybook. You should only provide code modifications and instructions for the user to run commands themselves.**

## General Code Guidelines
- Do NOT generate any diagrams.
- Do NOT generate emojis.
- Do NOT add unnecessary comments in the code.

## Execution Restrictions
The AI Agent should ONLY:
- Read and analyze code
- Modify files and write code
- Provide instructions for the user to run commands

### TypeScript Best Practices
- **Always use explicit types** for component props
- **Use interfaces** for complex object shapes

## Components development guidelines
- Do not add texts without its translation file in locales/*.json
- Keep the components code clean and readable. Do not add unnecessary comments.
