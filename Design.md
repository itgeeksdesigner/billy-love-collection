I want to build this project using HTML and CSS with a proper structure and coding standards.

All styling must be written in a separate style.css file. You must define all root variables in CSS, including variables for colors, typography (H1 to H6 and body text from 10px to 20px), font weights, border radius, spacing, layout (container width, gutter width), and text transformations.

Do not use margin anywhere. Always use display: flex (row/column), along with padding and gap for spacing.

Inline CSS is strictly not allowed in the HTML file.

For responsiveness, create and use a separate responsive.css file. For JavaScript, use a separate script.js file.

Font sizes for headings should be defined only once using variables (e.g., H1–H6), and should not be repeated anywhere. Each heading level must have its own variable.

Use placehold.co for placeholder images. All images must be stored inside an images folder with proper and meaningful names. The logo should also be a placeholder image.

All spacing and typography variables should be adjusted (reduced/scaled) for tablet and mobile screens.

Do not use rem units—use only px everywhere.

For icons, use Phosphor Icons (phosphor.com) only. Do not use SVGs or emojis directly.

Also, include a placeholder favicon and store it in the images folder.

For future inner pages, all CSS and JavaScript must still be written in the same style.css and script.js files.

When creating any section (for example, a blog section), follow a proper structure:
	•	Section
	•	Container
	•	Inside container: heading, images, rows, buttons, and other content
