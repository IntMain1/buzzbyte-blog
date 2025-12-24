<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Post;
use App\Models\Tag;
use App\Models\Comment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with realistic demo data.
     */
    public function run(): void
    {
        $this->command->info('🌱 Seeding BuzzByte database...');

        $users = $this->createUsers();
        $tags = $this->createTags();
        $posts = $this->createPosts($users, $tags);
        $this->createComments($posts, $users);
        $this->createLikes($posts, $users);

        $this->command->newLine();
        $this->command->info('✅ Demo data seeded successfully!');
        $this->command->table(['Email', 'Password'], [
            ['demo@buzzbyte.com', 'demo1234'],
            ['john@example.com', 'password'],
            ['jane@example.com', 'password'],
        ]);
    }

    private function createUsers(): array
    {
        $this->command->info('👤 Creating users...');

        return [
            'john' => User::create([
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'password' => Hash::make('password'),
            ]),
            'jane' => User::create([
                'name' => 'Jane Smith',
                'email' => 'jane@example.com',
                'password' => Hash::make('password'),
            ]),
            'demo' => User::create([
                'name' => 'Demo User',
                'email' => 'demo@buzzbyte.com',
                'password' => Hash::make('demo1234'),
            ]),
            'alex' => User::create([
                'name' => 'Alex Johnson',
                'email' => 'alex@example.com',
                'password' => Hash::make('password'),
            ]),
            'sarah' => User::create([
                'name' => 'Sarah Wilson',
                'email' => 'sarah@example.com',
                'password' => Hash::make('password'),
            ]),
        ];
    }

    private function createTags(): array
    {
        $this->command->info('🏷️  Creating tags...');

        $tagData = [
            'technology' => 'Technology',
            'laravel' => 'Laravel',
            'react' => 'React',
            'docker' => 'Docker',
            'tutorial' => 'Tutorial',
            'news' => 'News',
            'discussion' => 'Discussion',
            'javascript' => 'JavaScript',
            'php' => 'PHP',
            'devops' => 'DevOps',
            'career' => 'Career',
            'productivity' => 'Productivity',
        ];

        $tags = [];
        foreach ($tagData as $slug => $name) {
            $tags[$slug] = Tag::create(['name' => $name, 'slug' => $slug]);
        }

        return $tags;
    }

    private function createPosts(array $users, array $tags): array
    {
        $this->command->info('📝 Creating posts...');

        $postsData = [
            [
                'title' => 'Welcome to BuzzByte! 🎉',
                'body' => <<<'MARKDOWN'
## Hello World!

Welcome to **BuzzByte**, the ephemeral blog platform where posts disappear after 24 hours.

This creates a sense of *urgency* and encourages timely discussions.

### Features

- 🕐 Posts auto-delete after 24 hours
- ❤️ Like and comment on posts
- ✍️ Markdown editor with live preview
- 🌙 Dark mode support
- 🏷️ Tag-based organization

> "The best time to post was yesterday. The second best time is now." - BuzzByte

Start sharing your thoughts before they're gone forever!
MARKDOWN,
                'excerpt' => 'Welcome to BuzzByte, the ephemeral blog where posts vanish after 24 hours!',
                'user' => 'demo',
                'tags' => ['technology', 'news'],
            ],
            [
                'title' => 'Getting Started with Laravel 12',
                'body' => <<<'MARKDOWN'
## Laravel 12 is Here!

Laravel 12 brings exciting new features and improvements. Let's explore what's new:

### Key Features

1. **Improved Performance** - Up to 2x faster than Laravel 11
2. **Better Developer Experience** - New debugging tools
3. **New Artisan Commands** - Simplified workflows

### Quick Start

```php
composer create-project laravel/laravel my-app
cd my-app
php artisan serve
```

### Configuration

Update your `.env` file:

```env
APP_NAME=MyApp
APP_DEBUG=true
```

> Laravel makes PHP development a joy.

### Resources

- [Official Documentation](https://laravel.com/docs)
- [Laracasts](https://laracasts.com)

What's your favorite Laravel feature? Let me know in the comments! 👇
MARKDOWN,
                'excerpt' => 'Discover the exciting new features in Laravel 12 and how to use them.',
                'user' => 'john',
                'tags' => ['laravel', 'php', 'tutorial'],
            ],
            [
                'title' => 'Docker Tips for Developers',
                'body' => <<<'MARKDOWN'
## Docker Best Practices

Here are some tips to improve your Docker workflow:

### 1. Use Multi-Stage Builds

```dockerfile
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

### 2. Leverage Layer Caching

Put frequently changing steps at the end of your Dockerfile.

### 3. Keep Images Small

| Base Image | Size |
|------------|------|
| node:20 | 1.1GB |
| node:20-slim | 200MB |
| node:20-alpine | 130MB |

### 4. Use docker-compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
```

**Pro tip:** Always use `.dockerignore` to exclude unnecessary files!

What Docker tips do you have? Share below! 🐳
MARKDOWN,
                'excerpt' => 'Learn Docker best practices to streamline your development workflow.',
                'user' => 'jane',
                'tags' => ['docker', 'devops', 'tutorial'],
            ],
            [
                'title' => 'React 19: What You Need to Know',
                'body' => <<<'MARKDOWN'
## React 19 Overview

React 19 introduces several game-changing improvements:

### Server Components

```jsx
// This runs on the server!
async function BlogPost({ id }) {
  const post = await db.posts.find(id);
  return <article>{post.content}</article>;
}
```

### Improved Hooks

- `use()` - The new async-friendly hook
- Better Suspense integration
- Simplified state management

### Actions

```jsx
function Form() {
  async function handleSubmit(formData) {
    'use server';
    await saveToDatabase(formData);
  }
  
  return <form action={handleSubmit}>...</form>;
}
```

### Migration Tips

1. Update your dependencies
2. Test Server Components gradually
3. Review the [migration guide](https://react.dev/blog)

The ecosystem continues to evolve, making React even more powerful! 🚀
MARKDOWN,
                'excerpt' => 'An overview of React 19 and its new features for modern web development.',
                'user' => 'alex',
                'tags' => ['react', 'javascript', 'technology'],
            ],
            [
                'title' => '5 Productivity Hacks for Developers',
                'body' => <<<'MARKDOWN'
## Level Up Your Productivity

After years of coding, here are my top productivity tips:

### 1. 🍅 Pomodoro Technique

- 25 minutes focused work
- 5 minute break
- Repeat 4 times, then 15 min break

### 2. ⌨️ Master Your Editor

Must-know shortcuts:

| Action | VS Code |
|--------|---------|
| Command Palette | `Ctrl+Shift+P` |
| Go to File | `Ctrl+P` |
| Multi-cursor | `Alt+Click` |

### 3. 🤖 Embrace AI Tools

- GitHub Copilot for code completion
- ChatGPT for problem-solving
- Automated testing

### 4. 📝 Document Everything

> "Code tells you how, comments tell you why"

### 5. 🧘 Take Breaks

Your brain needs rest. Step away regularly!

---

What productivity tips work for you? Share in the comments! 💬
MARKDOWN,
                'excerpt' => 'Boost your coding efficiency with these proven productivity techniques.',
                'user' => 'sarah',
                'tags' => ['productivity', 'career', 'discussion'],
            ],
            [
                'title' => 'Why TypeScript is a Must in 2024',
                'body' => <<<'MARKDOWN'
## TypeScript: Not Just a Trend

If you're still writing vanilla JavaScript, here's why you should switch:

### Type Safety

```typescript
// Catch errors at compile time!
function greet(name: string): string {
  return `Hello, ${name}!`;
}

greet(123); // ❌ Error: Argument of type 'number' is not assignable
```

### Better IDE Support

- Autocomplete that actually works
- Instant error detection
- Refactoring confidence

### Modern Features

```typescript
// Interfaces
interface User {
  id: number;
  name: string;
  email?: string;
}

// Generics
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
```

### The Stats

- 78% of developers prefer TypeScript
- Used by Microsoft, Google, Airbnb
- 40% fewer bugs in production

**Start small:** Add TypeScript to one file, then gradually migrate.

Are you using TypeScript? What's your experience? 👇
MARKDOWN,
                'excerpt' => 'Why TypeScript has become essential for modern JavaScript development.',
                'user' => 'john',
                'tags' => ['javascript', 'technology', 'discussion'],
            ],
        ];

        $posts = [];
        foreach ($postsData as $data) {
            $post = Post::create([
                'title' => $data['title'],
                'body' => $data['body'],
                'excerpt' => $data['excerpt'],
                'user_id' => $users[$data['user']]->id,
            ]);
            
            $tagIds = array_map(fn($slug) => $tags[$slug]->id, $data['tags']);
            $post->tags()->attach($tagIds);
            
            $posts[] = $post;
        }

        return $posts;
    }

    private function createComments(array $posts, array $users): void
    {
        $this->command->info('💬 Creating comments...');

        $commentsData = [
            [$posts[0], 'jane', 'Welcome to the platform! This is exactly what we needed. 🙌'],
            [$posts[0], 'alex', 'Love the ephemeral concept. Creates urgency to engage!'],
            [$posts[1], 'demo', 'Great tutorial! Very helpful for beginners starting with Laravel.'],
            [$posts[1], 'sarah', 'The new Artisan commands are a game changer. Thanks for sharing!'],
            [$posts[2], 'john', 'Multi-stage builds saved so much space in our CI/CD pipeline.'],
            [$posts[2], 'alex', 'Docker has changed how I deploy applications. These tips are gold! 🐳'],
            [$posts[3], 'jane', "Can't wait to try React 19 in production!"],
            [$posts[3], 'demo', 'Server Components look promising but the learning curve is steep.'],
            [$posts[4], 'john', 'Pomodoro changed my life. Highly recommend!'],
            [$posts[4], 'jane', 'Great list! I would add: minimize meetings whenever possible.'],
            [$posts[5], 'sarah', 'Switched to TypeScript last year. Never looking back!'],
            [$posts[5], 'alex', 'The IDE support alone makes it worth the switch. Great article!'],
        ];

        foreach ($commentsData as [$post, $userKey, $body]) {
            Comment::create([
                'body' => $body,
                'post_id' => $post->id,
                'user_id' => $users[$userKey]->id,
            ]);
        }
    }

    private function createLikes(array $posts, array $users): void
    {
        $this->command->info('❤️  Creating likes...');

        $userIds = array_map(fn($u) => $u->id, array_values($users));
        
        foreach ($posts as $index => $post) {
            // Each post gets a random number of likes
            $likeCount = min(count($userIds), rand(2, 5));
            $likers = array_slice($userIds, 0, $likeCount);
            shuffle($likers);
            $post->likes()->attach(array_slice($likers, 0, $likeCount));
        }
    }
}
