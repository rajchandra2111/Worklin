# Worklin_ Blog Writer Guide

Welcome to the Worklin_ content team! We are using a robust, developer-first backend (Supabase) to power our platform. Until we build a custom visual Content Management System (CMS) dashboard, you will publish your articles directly into the database. 

It’s very easy once you do it once. Here is your step-by-step guide:

## Prerequisite: Get Access
The platform administrator (your boss) needs to invite you to the **Supabase Dashboard** for the Worklin_ project. 
1. Ask the admin to go to their Supabase Project Settings -> Access Management.
2. They will send an invite to your email address.
3. Accept the invite and create your Supabase account.

## How to Write and Publish a Blog Post

### Step 1: Write in Markdown
Our blog natively supports **Markdown**. You should write your articles in a Markdown editor (like Notion, Obsidian, or a free online editor like [Dillinger.io](https://dillinger.io/)).

- Use `#` for the main title (though the `title` field will also show it).
- Use `##` for H2 subheadings.
- Use `**bold**` for bold text.
- Use `[Link Text](https://url.com)` for links.

### Step 2: Open the Database Table
1. Log into Supabase and open the **Worklin_** project.
2. On the left sidebar, click on **Table Editor** (the icon looks like a grid/spreadsheet).
3. Under the `public` schema, click on the **`blog_posts`** table.

### Step 3: Insert Your Post
1. Click the green **"Insert row"** button at the top right of the table.
2. A side panel will open where you fill out the details of your post:
   - **`id`**: Leave this blank (it auto-generates).
   - **`title`**: The headline of your article.
   - **`slug`**: The URL-friendly version of your title. Use lowercase and hyphens (e.g., `how-to-hire-developers`). *This must be unique!*
   - **`content`**: Paste your complete Markdown article here.
   - **`excerpt`**: A 1-2 sentence summary of the article (used on the main blog page).
   - **`category`**: E.g., `For Freelancers`, `For Clients`, or `Platform Updates`.
   - **`cover_image`**: Paste a URL to an image. We recommend finding high-quality images on Unsplash, right-clicking, and choosing "Copy Image Address".
   - **`author_id`**: Leave blank for now, or paste your Supabase User UUID if instructed.
   - **`published_at`**: **CRITICAL STEP.** Click the calendar icon and select "Now" to publish immediately. If you leave this blank, the post will be saved as a Draft and won't appear on the live site.
   - **`created_at` / `updated_at`**: Leave blank (they auto-generate).

3. Click **Save**.

Your article is now instantly live on the Worklin_ platform!

## How to Edit or Delete a Post
- **Edit:** In the Table Editor, simply double-click any cell in the `blog_posts` table to change the text, then press Enter.
- **Delete:** Select the checkbox next to a row, and click the "Delete 1 row" button at the top of the table.

## Tips for Great Posts
- **Keep it scannable:** Use lots of `##` subheadings and bullet points.
- **Always include a cover image:** Articles without a cover image will fall back to a generic placeholder. Use compelling imagery!
- **SEO is key:** Make sure your `title` and `slug` contain keywords our target audience is searching for.
