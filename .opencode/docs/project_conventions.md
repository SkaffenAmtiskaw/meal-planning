# Naming Conventions
- To align with JS/TS project conventions, use camelCase or UpperCamelCase (for React components) for file names.

# Barrel Files
- Barrel files should NEVER have logic.

# Unit Tests
- Reusable mocks should be placed in `test/mocks` - mock files should NEVER be in `src/`

# Generic vs Domain-Specific Utilities
- `src/_utils` should contain generic utilities which have no domain-knowledge. Naming conventions should be generic, and indicate what they do rather than suggesting a domain-specific purpose.
- Utilities which have domain-knowledge should exist in `_utils` directories in the directories where they are consumed. If they are consumed in multiple places, the `_utils` directory should be placed in the lowest common parent directory of all consuming modules.

# Architecture
## Prefer Server Components
ALWAYS implement as a Server Component first. Only add `'use client'` when you have a specific reason that requires client-side JavaScript.

**You DO NOT need `'use client'` for:**                                                                              
- Async data fetching (use `async function` + `await`)                                                              
- Conditional rendering based on data                                                                                                            
- Static UI components                                                                                                    
- Components that only use props and render JSX                                                                         
              
**You ONLY need `'use client'` for:**                                                                                                              
- Browser APIs (localStorage, window, document)                                                                      
- React hooks (useState, useEffect, useContext)                                                            
- Event handlers that need closure state                                                                 
- Client-side interactivity (drag and drop, complex animations)

**Pattern for Data Fetching:**                                                                                                                   
```tsx
// ✅ Server Component - preferred
const PreferredServerComponent = async () => {
    const data = await fetchData();
    return <div>{data}</div>;
}
                           
// ❌ Client Component - not preferred                                                                                                             
'use client'                                  
const NotPreferredClientComponent = () => {                         
    const [data, setData] = useState();                             
    useEffect(() => {
        fetchData().then(setData);
    }, []);
    
    return <div>{data}</div>;                    
}
```

When displaying loading states:
- Use React's <Suspense> with Server Components
- Suspense fallback renders immediately (no 'use client' needed)        
- The async component resolves when data is ready

Before adding 'use client', ask yourself:
1. Can this be an async server component?
2. Can I use Suspense for loading states?
3. Is there a simpler server-side solution?