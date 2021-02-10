# svelte-feed

Simple fullstack app for facebook-like feed. For selfhosting and selfposting.
![](svelte-feed.gif)

### description

A simple application for posting notes and links. Created for those cases when you do not want to publish important and personal information in public services.

Used tools:

[Svelte](https://svelte.dev/) - reactive JS framework.

[MongoDB](https://www.mongodb.com) - nosql database.

[Cloudinary](https://cloudinary.com) - cloud for storing media files with API.


### requirements

1. Install [docker-compose](https://docs.docker.com/compose/install/).
2. If you need posting images - set `IMAGE_ENABLE` in [env.js](frontend/src/env.js) to true. Next I recommend you to register at [cloudinary](https://cloudinary.com), make unsigned upload preset and change `CLOUD_NAME` and `UPLOAD_PRESET` in [env.js](frontend/src/env.js) to yours. In free plan cloudinary grants you storage for 25GB of files.

### usage

1. Run docker-compose
```
docker-compose up -d
```
2. Open [http://localhost:80](http://localhost:80)


### features

- First, you can create posts.
- All urls in the text are converted into links, a preview is created for the first link.
- You can add images to the post, the number of images is unlimited. Just select the file and click `Добавить`.
- You can add multiple tags to a post, just specify words separated by a space. Each word will be added to the tag cloud.
- Text search is not case sensitive, `such` and `SuCh` in the search field will give the same result.
