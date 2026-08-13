# Learning Content Management Skill

## Purpose

Implement teacher learning-content import and classroom assignment using one
consistent flow for different content types and file formats.

Supported content types:

- Learning Document
- Exercise
- Vocabulary
- Future content types

The uploaded file format must remain independent from the learning content type.

---

## Exact User Flow

Implement this flow in this order:

```text
Teacher
  ↓
1. Import New Content
  ↓
2. Choose Content Type
  ├── Learning Document
  ├── Exercise
  └── Vocabulary
  ↓
3. Upload File
  ├── DOCX
  ├── XLSX
  ├── PDF
  ├── CSV
  └── Future formats
  ↓
4. Parse & Extract
  ↓
5. Normalize & Validate
  ├── Invalid → Fix / Re-upload
  └── Valid
  ↓
6. Preview & Edit
  ↓
7. Save / Publish
  ↓
8. Assign to Classroom
  ├── Select classroom(s)
  └── Optional deadline/options
  ↓
9. Student
  ├── View
  ├── Learn / Answer
  ├── Submit
  └── Results / Feedback
```

Do not skip the preview/review step for imported content.

---

## Core Architecture

Separate these concerns:

```text
Upload
  ↓
File Parser
  ↓
Raw Content
  ↓
Normalizer
  ↓
Validator
  ↓
Preview / Edit
  ↓
Learning Content
  ↓
Classroom Assignment
```

File format is an input concern.

Learning content type is a domain concern.

Do not create business logic that depends directly on a specific file format.

Avoid structures such as:

```text
ExcelExerciseService
DocxExerciseService
PdfVocabularyService
```

Prefer:

```text
Importer
├── DocxImporter
├── XlsxImporter
├── PdfImporter
└── CsvImporter

        ↓

Normalized Content

        ↓

Content Type
├── Learning Document
├── Exercise
└── Vocabulary
```

---

## Importer Rules

Each importer should have one responsibility:

> Read a supported file format and produce normalized/raw content that the
> content pipeline can process.

Importers must not:

- create classroom assignments
- publish content
- enforce teacher authorization
- contain UI logic
- directly implement business rules

Adding a new file format should require adding an importer, not rewriting
the content domain.

---

## Content Type Rules

The teacher explicitly chooses the intended content type before uploading.

The system may inspect the uploaded file and warn about an apparent mismatch.

Example:

```text
Selected type: Vocabulary

Detected content: Multiple-choice questions

Warning:
This file appears to contain exercises.
Continue or change content type?
```

A mismatch should not silently change the teacher's selected content type.

---

## Normalized Domain Model

The import pipeline must convert different source formats into a stable
internal representation.

Conceptually:

```text
LearningContent
├── id
├── teacherId
├── type
├── title
├── description
├── status
├── sourceFile
├── content
├── metadata
├── createdAt
└── updatedAt
```

The exact database schema must be designed from the existing project rather
than copied blindly from this document.

Content-specific structures should be represented separately where their
behavior differs.

Example:

```text
Exercise
├── questions
│   ├── question
│   ├── type
│   ├── options
│   └── answer
```

Do not force fundamentally different content types into one giant table or
one untyped JSON structure without a clear reason.

---

## Validation

Validation happens after parsing and normalization.

Validate:

- required fields
- content structure
- supported question types
- required answers/options
- duplicate or malformed items where relevant
- file/content consistency
- size/count limits

Validation errors must be understandable to teachers.

Example:

```text
Question 7:
Missing correct answer.

Question 12:
Multiple-choice question has only 2 options.
```

Do not silently discard invalid content.

---

## Preview & Edit

The teacher must be able to review imported content before publishing.

The preview should allow appropriate editing for the content type.

For exercises this may include:

- question text
- options
- correct answer
- question type

For vocabulary:

- word
- definition
- translation
- example

For documents:

- title
- description
- extracted content/metadata

The preview represents the normalized content, not the original file layout.

---

## Persistence

Do not treat the uploaded file as the primary representation of the
learning content.

The uploaded file is the source/import artifact.

The normalized learning content is the application representation.

Conceptually:

```text
Original File
     ↓
Import Artifact

Normalized Content
     ↓
Database

Published Content
     ↓
Classroom Assignment
```

Keep the original file when useful for audit/re-import purposes, but do not
require it to render or use the published content.

---

## Classroom Assignment

Learning content should be reusable.

Do not make an exercise or document permanently belong to one classroom.

Prefer:

```text
Teacher
  ↓
Learning Content
  ↓
Assignment
  ↓
Classroom
```

An assignment may contain:

- content ID
- classroom ID
- assigned by teacher
- publish status
- assigned date
- optional due date
- optional settings

This allows the same content to be assigned to multiple classrooms later.

---

## Student Flow

Students should only see content assigned to classrooms in which they
participate.

Conceptually:

```text
Student
  ↓
Classroom Membership
  ↓
Assignment
  ↓
Learning Content
```

Do not grant access merely because a student knows an internal content ID.

Authentication and authorization must be enforced server-side.

---

## Storage

Use file storage for uploaded source files.

Store structured learning content separately in the database.

Do not store large files directly inside relational database records unless
there is a deliberate architectural reason.

The exact storage provider must follow the project's approved stack.

---

## Error Handling

The import process should expose clear states:

```text
uploaded
processing
parsed
validation_failed
ready_for_review
published
failed
```

A failed import must not create partially published content.

The teacher should be able to retry or upload a replacement file.

---

## API Boundary

Keep the API flow explicit.

Conceptually:

```text
POST   /content/import
GET    /content/import/:id
POST   /content/import/:id/validate
PATCH  /content/:id
POST   /content/:id/publish

POST   /content/:id/assignments
GET    /classrooms/:id/assignments
```

Do not implement these exact routes if the existing project uses a different
API convention. Follow existing project conventions.

---

## Security

- Require authentication for teacher content management.
- Verify teacher ownership/permission server-side.
- Validate uploaded file type and size.
- Never trust the client-provided content type or file metadata.
- Do not expose private source files publicly.
- Do not trust classroom IDs supplied by the client.
- Students can only access assignments for classrooms they belong to.

---

## Testing

Test the pipeline independently:

```text
Importer
  ↓
Normalizer
  ↓
Validator
  ↓
Persistence
  ↓
Assignment
```

At minimum cover:

- valid imports
- malformed files
- unsupported formats
- invalid content
- content-type mismatch
- preview/edit behavior
- publishing
- classroom assignment
- unauthorized access
- student access restrictions

Add E2E coverage for the critical teacher flow:

```text
Choose type
→ Upload
→ Parse
→ Review
→ Publish
→ Assign
```

---

## Scope Control

Do not automatically add:

- AI parsing
- OCR
- automatic question generation
- automatic content classification
- grading algorithms
- gamification
- analytics
- notifications

These may be future capabilities but require explicit approval.

If a requirement is ambiguous or introduces a significant architectural
decision, stop and ask for approval before implementing it.

---

## Completion

After implementation, provide a brief report:

### Completed

What was implemented.

### Changed

Important files/areas changed.

### Verified

Only tests/checks that were actually run.

Mention anything incomplete or failing.
