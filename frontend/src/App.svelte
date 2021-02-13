<script>
	import axios from 'axios';
	import {
		Button,
		ButtonGroup,
		Col,
		Row,
		Input,
		InputGroup,
		InputGroupAddon,
		Label,
		Table,
		Toast,
		ToastBody,
		ToastHeader
	} from 'sveltestrap';
	import {
		onMount
	} from "svelte";
	import {
  	CLOUD_NAME,
  	UPLOAD_PRESET,
		IMAGE_ENABLE,
		HEADER_COLOR
  } from './env.js';

	var files;
	var posts = [];
	var fullPosts = [];
	var isFilter = 'none';
	var searchFilter = '';
	var listOfTags = [];
	var newPost = {
		tag: '',
		body: '',
		images: []
	}
	var postPreviews = [];
	var postPreviewsBody = [];

	function formatDate(fullDate) {
		let newDate = fullDate.split('T');
		let newTime = newDate[1].split(':');
		return newDate[0] + ' ' + newTime[0] + ':' + newTime[1];
	}

	function linkify(inputText) {
		var replacedText, replacePattern1, replacePattern2, replacePattern3;
		//URLs starting with http://, https://, or ftp://
		replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
		replacedText = inputText.post.body.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

		//URLs starting with "www." (without // before it, or it'd re-link the ones done above).
		replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
		replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

		//Change email addresses to mailto:: links.
		replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
		replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

		return replacedText;
	}

	function findFirstUrl(post) {
		return post.substring(post.indexOf('href=') + 6, post.indexOf('target=') - 2);
	}

	function getTags() {
		var newListOfTags = [];
		fullPosts.forEach(function(entry) {
			newListOfTags.push(...entry.tag.split(' '));
		});
		listOfTags = [...new Set(newListOfTags)];
	}

	function filterByText() {
		if (searchFilter != '') {
			isFilter = 'text';
		} else {
			isFilter = 'none';
		}
		posts = fullPosts.filter(post => post.body.toLowerCase().includes(searchFilter.toLowerCase()));
	}

	function filterByTag(tag) {
		isFilter = tag;
		posts = fullPosts.filter(post => post.tag.includes(tag.tag));
	}

	function filterByTagPost(tag) {
		isFilter = tag.post;
		posts = fullPosts.filter(post => post.tag.includes(tag.post.tag));
	}

	function cleanFilter() {
		isFilter = 'none';
		searchFilter = '';
		getPosts();
	}

	function uploadFile() {
		const url = 'https://api.cloudinary.com/v1_1/'+CLOUD_NAME+'/image/upload';
		var formData = new FormData();
		formData.append("file", files[0]);
		formData.append("upload_preset", UPLOAD_PRESET);
		axios.post(url, formData)
			.then((res) => {
				console.log(res.data);
				let newimage = {
					src: res.data.url
				}
				newPost.images.push(newimage);
				newPost.images = newPost.images;
			})
			.catch((error) => {
				console.log(error);
			});
	}

	function getPosts() {
		axios.get('/posts/mongo')
			.then((res) => {
				fullPosts = res.data;
				if (isFilter == 'none') {
					posts = fullPosts;
				} else if (isFilter == 'text') {
					filterByText();
				} else {
					filterByTag(isFilter);
				}
				getTags();
				console.log(posts);
			});
	};

	function removePost(post) {
		const path = `/posts/mongo/${post.post._id}`;
		axios.delete(path)
			.then(() => {
				getPosts();
			})
			.catch((error) => {
				console.error(error);
				getPosts();
			});
	};

	function editPost(post) {
		post.post.isEdited = !post.post.isEdited;
		updatePost(post);
	}

	function updatePost(post) {
		const payload = {
			tag: post.post.tag,
			body: post.post.body,
			isEdited: post.post.isEdited
		};
		const path = `/posts/mongo/${post.post._id}`;
		axios.put(path, payload)
			.then(() => {
				getPosts();
			})
			.catch((error) => {
				console.error(error);
				getPosts();
			});
	}

	function addPost() {
		if (newPost.tag == '') newPost.tag = 'Общее';
		const path = '/posts/mongo';
		axios.post(path, newPost)
			.then(() => {
				getPosts();
			})
			.catch((error) => {
				console.log(error);
				getPosts();
			});
		newPost = {
			tag: '',
			body: '',
			images: []
		}
	};

	function isContainUrl(post) {
		var contain = linkify(post).includes('href=');
		if (contain) {
			getPreview(post);
		}
		return contain;
	}

	function getPreview(post) {
		if (postPreviews[post.post._id] !== undefined) {
			if (postPreviewsBody[post.post._id] == post.post.body) return;
		};
		var result;
		var firstUrl = findFirstUrl(linkify(post));
		const metaload = {
			url: firstUrl
		};
		postPreviews[post.post._id] = '';
		postPreviewsBody[post.post._id] = post.post.body;
		axios.post('/posts/metadata', metaload)
			.then((res) => {
				result = '<hr style="height:2px;border-width:0;color:silver;background-color:silver">'
				result = result + `<a target="_blank" href="${res.data.url}">`;
				result = result + `<strong>${res.data.title}</strong>`
				result = result + `<img style="border: 2px solid silver;border-radius: 4px;max-width: 100%;" title="${res.data.description}" src="${res.data.image}"/></a>`;
				postPreviews[post.post._id] = result;
			})
			.catch((error) => {
				console.log(error);
			});
	};
	onMount(getPosts);
</script>

<svelte:head>
	<script src="lightbox-plus-jquery.min.js"></script>
	<link href="lightbox.css" rel="stylesheet" />
</svelte:head>

<style>
	.gallery {
		display: flex;
		flex-flow: row wrap;
	}

	.galleryhref {
		margin-right: 6px;
		margin-bottom: 6px;
	}

	img {
		width: auto;
		max-height: 140px;
		max-width: 100%;
		border-radius: 4px;
		border: 2px solid silver;
	}

	:global(body) {
		background-color: #ffffff;
		overflow-x: hidden;
		background-color: #fdf6ff;
		background-image: url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23a8d4f9' fill-opacity='0.39' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E");
	}
</style>

<div>
	<Row>
		<Col xs="0" sm="1" md="3" />
		<Col xs="12" sm="10" md="6">
		<Toast style="max-width: 100%;" light>
			<ToastHeader style="background-color: { HEADER_COLOR }">
				<strong>Что у Вас нового?</strong>
			</ToastHeader>
			<ToastBody>
				<InputGroup size="sm" style="padding-bottom: 10px;">
					<Input placeholder="tag" type="text" bind:value={newPost.tag} />
					<InputGroupAddon addonType="append">
						<Button class="btn-success" size="sm" on:click={addPost}>Создать пост</Button>
					</InputGroupAddon>
				</InputGroup>
				<Input type="textarea" bind:value={newPost.body} />
				{#if IMAGE_ENABLE}
				<InputGroup size="sm" style="padding-top: 10px;">
					<Input id="fileUpload" type="file" bind:files style="width: calc(100% - 100px);" />
					<InputGroupAddon addonType="append">
						<Button class="btn-success" on:click={uploadFile}>Добавить</Button>
					</InputGroupAddon>
				</InputGroup>
				{/if}
				{#if newPost.images[0] && IMAGE_ENABLE}
				<hr style="height:2px;border-width:0;color:silver;background-color:silver">
				<div class="gallery">
				{#each newPost.images as image}
				  <a class="galleryhref" href={ image.src } data-lightbox="newPost">
				  <img src={ image.src } alt='' />
				  </a>
		    {/each}
				</div>
				{/if}
			</ToastBody>
		</Toast>
		<Toast style="max-width: 100%;" light>
			<ToastHeader style="background-color: { HEADER_COLOR }">
				<strong>Поиск:</strong>
			</ToastHeader>
			<ToastBody>
				<InputGroup size="sm" style="padding-bottom: 10px;">
					<Input placeholder="поиск" type="text" bind:value={searchFilter} />
					<InputGroupAddon addonType="append">
						<Button class="btn-info" size="sm" on:click={cleanFilter}>Очистить поиск</Button>
						<Button class="btn-success" size="sm" on:click={filterByText}>Искать</Button>
					</InputGroupAddon>
				</InputGroup>
				{#each listOfTags as tag}
				<Button class="btn-info" size="sm" style="margin-right: 6px;margin-bottom: 6px;" on:click={filterByTag({ tag })}>{ tag }</Button>
				{/each}
			</ToastBody>
		</Toast>
		{#each posts as post}
		<Toast style="max-width: 100%;">
      <ToastHeader style="background-color: { HEADER_COLOR }">
				<Button class="btn-info" size="sm" style="margin-right: 6px;" on:click={filterByTagPost({ post })}>{ post.tag }</Button>
				<Label>{ formatDate(post.date) }</Label>
				<ButtonGroup style="position: absolute; right: 28px;">
				<Button color="info" size="sm" on:click={editPost({ post })}>
					{#if (post.isEdited)}
					Обновить
					{:else}
					Править
				  {/if}</Button>
				<Button color="danger" size="sm" on:click={removePost({ post })}>Удалить</Button>
				</ButtonGroup>
			</ToastHeader>
      <ToastBody>
				{#if (!post.isEdited)}
				<div style="word-wrap: break-word;white-space: pre-wrap;">{@html linkify({ post })}</div>
				{:else}
        <Input type="textarea" bind:value={ post.body }/>
				{/if}
				{#if post.images[0] && IMAGE_ENABLE}
				<hr style="height:2px;border-width:0;color:silver;background-color:silver">
				<div class="gallery">
				{#each post.images as image}
				  <a class="galleryhref" href={ image.src } data-lightbox={post._id}>
					<img src={ image.src } alt='' />
				  </a>
				{/each}
				</div>
				{/if}
				{#if (isContainUrl({post}))}
				  {@html postPreviews[post._id]}
				{/if}
      </ToastBody>
    </Toast>
		{/each}
		</Col>
		<Col xs="0" sm="1" md="3"/>
	</Row>
</div>
