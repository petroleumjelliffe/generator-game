# Enhancement Workflow Instructions

## For ANY new request (bugs or enhancements):

1. **Break down and plan**
   - Break the request down into one or more discrete tasks
   - Use the TodoWrite tool to create and track the plan
   - Ensure the plan is clear and actionable

2. **Create GitHub issue(s)**
   - Create GitHub issue(s) for each task (labeled as `bug` or `enhancement`)
   - Assign all issues to `petroleumjelliffe`
   - Include a summary of the plan in the issue description
   - **Do this BEFORE creating branches** so branch names can reference issue numbers

3. **Ask which to start with**
   - If multiple issues were created, ask the user which one to begin with
   - Wait for confirmation before proceeding

4. **Create feature branch**
   - Branch naming convention: `{issue-number}-{bug|enhancement}-{title}`
   - Examples:
     - `7-bug-mobile-drag`
     - `4-enhancement-warehouse-system`
   - Always create the branch from `main` before making any changes
   - **NEVER commit directly to main**

5. **Consider Architecture Decision Records (ADRs)**
   - Before implementing, consider if this change involves an architectural decision
   - Create or update ADRs when:
     - Adding new systems or subsystems
     - Choosing between multiple architectural approaches
     - Introducing new patterns or paradigms
     - Making decisions that affect multiple systems
     - Making changes that will be hard to reverse later
   - ADRs are stored in `/docs/adr/` following the numbered format
   - Suggest creating/updating ADRs when appropriate
   - See `/docs/adr/README.md` for ADR format and guidelines

6. **Implement the changes**
   - Work on the feature branch
   - Update TodoWrite tool as you progress through tasks
   - Keep the user informed of progress
   - Create/update ADRs if architectural decisions were made

7. **DO NOT merge to main**
   - When work is complete, leave it on the feature branch
   - We will create pull requests once the user is satisfied
   - Let the user know the branch is ready for review

## Deployment

- **GitHub Pages**: Served from the `gh-pages` branch (not `main`)
- **Automatic deployment**: GitHub Actions workflow deploys on every push to `main`
- **Deployment process**:
  1. Builds the game (`npm run build`)
  2. Copies `/docs` directory to build output
  3. Deploys `./dist` to `gh-pages` branch
- **Documentation**: Available at `https://petroleumjelliffe.github.io/generator-game/docs/`
- **Game**: Available at `https://petroleumjelliffe.github.io/generator-game/`

## Important notes:
- Always use TodoWrite for planning and tracking progress
- Always create issues before branches
- Always work on feature branches, never on main
- Always assign issues to petroleumjelliffe with appropriate labels
- GitHub Pages settings must point to `gh-pages` branch (root)
