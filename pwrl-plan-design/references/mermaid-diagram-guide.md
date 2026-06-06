# Mermaid Diagram Guide

This file documents when to generate Mermaid diagrams, which diagram types to use, and how to embed them in the implementation units.

## When to Generate a Diagram

Detect if a diagram would be beneficial:

| Condition                                    | Generate? | Diagram Type |
| -------------------------------------------- | --------- | ------------ |
| 5+ units with simple linear flow             | YES       | Flowchart    |
| 5+ units with complex interdependencies      | YES       | Sequence     |
| Units with state transitions                 | YES       | State        |
| Units with branching logic (if/else)         | YES       | Flowchart    |
| High-risk workflow that needs clarity        | YES       | Sequence     |
| User explicitly asks for diagram             | YES       | User chooses |
| 1-4 units in simple sequence                 | NO        | —            |
| Non-software domain                          | NO        | —            |

**Key principle:** Diagrams are optional visualization aids; they enhance clarity but are not required.

## Diagram Types

### 1. Sequence Diagram

**Best for:** Unit workflow with interactions, dependencies, and sequential flow.

**Use when:**
- Units call other units in a specific order
- There are clear dependency chains
- You want to show parallel vs. sequential execution

**Example:**

```mermaid
sequenceDiagram
    U1->>U2: Complete
    U2->>U3: Start
    U3->>U4: Complete
    U4->>U5: Complete
    note over U2,U3: Parallel possible
```

**Markdown syntax:**
```markdown
```mermaid
sequenceDiagram
    participant U1 as Create Schema
    participant U2 as Add Validation
    participant U3 as Build API

    U1->>U2: Ready
    U2->>U3: Validation ready
    U3->>U2: Request validation
```
```

### 2. State Diagram

**Best for:** Stateful logic, state transitions, and lifecycle workflows.

**Use when:**
- Units represent states (e.g., "Authenticated", "Validated", "Deployed")
- You want to show state machines or data lifecycle
- There are alternative paths (e.g., success vs. error handling)

**Example:**

```mermaid
stateDiagram-v2
    [*] --> U1: Start
    U1 --> U2: Schema ready
    U2 --> U3: Validation ready
    U3 --> U4: API ready
    U4 --> [*]: Complete

    U2 --> ERROR: Validation failed
    ERROR --> U2: Retry
```

**Markdown syntax:**
```markdown
```mermaid
stateDiagram-v2
    [*] --> Create_Schema
    Create_Schema --> Add_Validation
    Add_Validation --> Build_API
    Build_API --> Test
    Test --> [*]: Complete
```
```

### 3. Flowchart

**Best for:** Decision trees, branching logic, and conditional workflows.

**Use when:**
- Units have conditional execution ("if X, then U3; else U4")
- There are alternative paths through the plan
- You want to show decision points

**Example:**

```mermaid
flowchart TD
    U1["U1: Create Schema"]
    U2["U2: Add Validation"]
    U3["U3: Build API"]
    U4["U4: Write Tests"]
    DECISION{"All tests pass?"}
    U5["U5: Deploy"]

    U1 --> U2
    U2 --> U3
    U3 --> U4
    U4 --> DECISION
    DECISION -->|Yes| U5
    DECISION -->|No| U4
```

**Markdown syntax:**
```markdown
```mermaid
flowchart TD
    A["Start"] --> B["Create Schema"]
    B --> C["Add Validation"]
    C --> D{"Validation OK?"}
    D -->|Yes| E["Build API"]
    D -->|No| C
    E --> F["End"]
```
```

## How to Ask User for Diagram Preference

In Step 7 of `pwrl-plan-design/SKILL.md`:

```
Would you like a Mermaid diagram to visualize the workflow?

Options:
- Yes (Flowchart) — Best for decision trees and conditional logic
- Yes (Sequence) — Best for workflow and dependency chains
- Yes (State diagram) — Best for state transitions and lifecycle
- No — Skip diagram
```

## Embedding Diagrams in Output

Once user selects diagram type, generate and include in the output:

```yaml
# Implementation Units

## Diagram

```mermaid
[generated diagram code here]
```

## Units

### U1: [Unit Name]
...
```

## Diagram Sizing & Clarity

**Guidelines for readable diagrams:**

1. **Keep it simple:** Max 10-15 elements per diagram
2. **Label clearly:** Use descriptive unit names (not just "U1")
3. **Avoid crossing lines:** Reorder units if possible to minimize line crossings
4. **Use spacing:** Leave visual space between diagram elements
5. **Color coding (optional):** Use colors to group related units:
   - 🔵 Backend work
   - 🟢 Frontend work
   - 🟡 Testing/QA
   - 🔴 Deployment

## Examples

### Example 1: Simple Sequence (5 units)

**Diagram type:** Sequence

```mermaid
sequenceDiagram
    participant U1 as Schema
    participant U2 as API
    participant U3 as Auth
    participant U4 as Tests
    participant U5 as Deploy

    U1->>U2: Ready
    U2->>U3: Ready
    U3->>U4: Ready
    U4->>U5: Ready
```

---

### Example 2: Complex with Branching (7 units)

**Diagram type:** Flowchart

```mermaid
flowchart TD
    U1["U1: Schema"] --> U2["U2: API"]
    U2 --> U3["U3: Auth"]
    U3 --> U4["U4: Frontend"]
    U3 --> U5["U5: Payments"]
    U4 --> U6["U6: Tests"]
    U5 --> U6
    U6 --> U7["U7: Deploy"]
```

---

### Example 3: State Machine (Auth Flow)

**Diagram type:** State

```mermaid
stateDiagram-v2
    [*] --> U1: Start
    U1 --> U2: Password hash ready
    U2 --> U3: Session manager ready
    U3 --> U4: API protected
    U4 --> [*]: Complete
```

---

## Limitations & Fallbacks

**If diagram generation fails:**
1. Offer textual alternative:
   ```
   Unit Flow (Text):
   U1 (Create Schema)
     ↓
   U2 (Add API) ←─ U3 (Add Auth)
     ↓              ↓
   U4 (Test) ←─────
   ```
2. Proceed without diagram

**If Mermaid rendering isn't supported:**
1. Provide diagram code in markdown fence
2. Include note: "Diagram requires Mermaid support; view in GitHub or compatible editor"

## Integration Notes

- Diagram generation is optional (Step 7 of `pwrl-plan-design/SKILL.md`)
- Users can decline diagrams
- Diagrams are included in the design units object, then passed to S5 (generate)
- Non-software plans typically skip diagrams
