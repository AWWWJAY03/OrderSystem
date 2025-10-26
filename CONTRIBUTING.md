# Contributing to Order Management System

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/order-system.git`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/your-feature`

## Development

### Local Setup

1. Copy environment file: `cp env.example .env`
2. Fill in your configuration
3. Run development server: `npm run dev`

### Testing

- Test changes locally before submitting
- Check all pages and functionality
- Verify API integrations
- Test on mobile devices

## Code Style

### JavaScript/React

- Use ES6+ syntax
- Use functional components
- Keep components small and focused
- Add comments for complex logic

### CSS/Tailwind

- Use TailwindCSS utility classes
- Keep custom CSS minimal
- Use consistent spacing and colors

### Naming Conventions

- Components: PascalCase (e.g., `ProductGrid.jsx`)
- Functions: camelCase (e.g., `handleSubmit`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_URL`)

## Pull Request Process

1. Update README.md if needed
2. Add tests if applicable
3. Update CHANGELOG.md
4. Submit pull request with description

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
```

## Project Structure

```
order-system/
├── src/
│   ├── components/    # Reusable components
│   ├── pages/        # Page components
│   └── services/     # API services
├── backend/          # Apps Script code
├── automation/       # Playwright automation
├── .github/          # GitHub workflows
└── docs/            # Documentation
```

## Areas for Contribution

### Features

- Additional payment providers
- Inventory management
- Analytics dashboard
- Multi-language support
- Mobile app
- More shipping providers

### Improvements

- UI/UX enhancements
- Performance optimization
- Security hardening
- Better error handling
- Testing coverage
- Documentation

### Bug Fixes

- Report bugs via GitHub Issues
- Fix bugs and submit PR
- Test thoroughly

## Communication

- Use GitHub Issues for bugs and features
- Use Discussions for questions
- Follow code of conduct
- Be respectful and constructive

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue or start a discussion!

Thank you for contributing! 🎉
