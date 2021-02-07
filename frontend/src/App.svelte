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
		ToastHeader,
	} from 'sveltestrap';
	import {
		onMount
	} from "svelte";

	var posts = [];
	var fullPosts = [];
	var isFilter = 'none';
	var searchFilter = '';
	var listOfTags = [];
	var newPost = {
		tag: '',
		body: ''
	}
	var postPreviews = [];
	var postPreviewsBody = [];
	import {API_KEY} from './env.js';
	
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

	function getTags() {
    var newListOfTags = [];
		fullPosts.forEach(function(entry) {
      newListOfTags.push(entry.tag);
    });
		listOfTags = [...new Set(newListOfTags)];
		console.log(listOfTags);
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
		console.log(isFilter);
		posts = fullPosts.filter(post => post.tag.includes(tag.tag));
	}
	function filterByTagPost(tag) {
		isFilter = tag.post;
		console.log(isFilter);
		posts = fullPosts.filter(post => post.tag.includes(tag.post.tag));
	}

	function cleanFilter() {
		isFilter = 'none';
		getPosts();
	}

	function getPosts() {
		axios.get('/posts/mongo')
			.then((res) => {
				fullPosts = res.data;
				if (isFilter == 'none' ) {
					posts = fullPosts;
				} else if (isFilter == 'text' ) {
					filterByText();
				} else {
					filterByTag(isFilter);
				}
				getTags();
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
		console.log(newPost);
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
			body: ''
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
		const payload = {
			key: API_KEY,
			q: post.post.body,
		};
		var result;
		console.log(postPreviews);
		if (postPreviews[post.post._id] !== undefined) {
			if (postPreviewsBody[post.post._id] == post.post.body) return;
		}
		postPreviews[post.post._id] = '';
		postPreviewsBody[post.post._id] = post.post.body;
		axios.post('https://api.linkpreview.net', payload)
			.then((res) => {
				result = '<hr style="height:2px;border-width:0;color:silver;background-color:silver">'
				result = result + `<a target="_blank" href="${res.data.url}">`;
				result = result + `<strong>${res.data.title}</strong>`
				result = result + `<img style="border-radius: 4px;max-width: 100%;" title="${res.data.description}" src="${res.data.image}"/></a>`;
				postPreviews[post.post._id] = result;
			})
			.catch((error) => {
				console.log(error);
			});
	};

	onMount(getPosts);
</script>

<style>
	:global(body) {
		background-color: #ffffff;
		overflow-x: hidden;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56 28' width='56' height='28'%3E%3Cpath fill='%23ebebeb' fill-opacity='0.44' d='M56 26v2h-7.75c2.3-1.27 4.94-2 7.75-2zm-26 2a2 2 0 1 0-4 0h-4.09A25.98 25.98 0 0 0 0 16v-2c.67 0 1.34.02 2 .07V14a2 2 0 0 0-2-2v-2a4 4 0 0 1 3.98 3.6 28.09 28.09 0 0 1 2.8-3.86A8 8 0 0 0 0 6V4a9.99 9.99 0 0 1 8.17 4.23c.94-.95 1.96-1.83 3.03-2.63A13.98 13.98 0 0 0 0 0h7.75c2 1.1 3.73 2.63 5.1 4.45 1.12-.72 2.3-1.37 3.53-1.93A20.1 20.1 0 0 0 14.28 0h2.7c.45.56.88 1.14 1.29 1.74 1.3-.48 2.63-.87 4-1.15-.11-.2-.23-.4-.36-.59H26v.07a28.4 28.4 0 0 1 4 0V0h4.09l-.37.59c1.38.28 2.72.67 4.01 1.15.4-.6.84-1.18 1.3-1.74h2.69a20.1 20.1 0 0 0-2.1 2.52c1.23.56 2.41 1.2 3.54 1.93A16.08 16.08 0 0 1 48.25 0H56c-4.58 0-8.65 2.2-11.2 5.6 1.07.8 2.09 1.68 3.03 2.63A9.99 9.99 0 0 1 56 4v2a8 8 0 0 0-6.77 3.74c1.03 1.2 1.97 2.5 2.79 3.86A4 4 0 0 1 56 10v2a2 2 0 0 0-2 2.07 28.4 28.4 0 0 1 2-.07v2c-9.2 0-17.3 4.78-21.91 12H30zM7.75 28H0v-2c2.81 0 5.46.73 7.75 2zM56 20v2c-5.6 0-10.65 2.3-14.28 6h-2.7c4.04-4.89 10.15-8 16.98-8zm-39.03 8h-2.69C10.65 24.3 5.6 22 0 22v-2c6.83 0 12.94 3.11 16.97 8zm15.01-.4a28.09 28.09 0 0 1 2.8-3.86 8 8 0 0 0-13.55 0c1.03 1.2 1.97 2.5 2.79 3.86a4 4 0 0 1 7.96 0zm14.29-11.86c1.3-.48 2.63-.87 4-1.15a25.99 25.99 0 0 0-44.55 0c1.38.28 2.72.67 4.01 1.15a21.98 21.98 0 0 1 36.54 0zm-5.43 2.71c1.13-.72 2.3-1.37 3.54-1.93a19.98 19.98 0 0 0-32.76 0c1.23.56 2.41 1.2 3.54 1.93a15.98 15.98 0 0 1 25.68 0zm-4.67 3.78c.94-.95 1.96-1.83 3.03-2.63a13.98 13.98 0 0 0-22.4 0c1.07.8 2.09 1.68 3.03 2.63a9.99 9.99 0 0 1 16.34 0z'%3E%3C/path%3E%3C/svg%3E");
	}
</style>

<div>
	<Row>
		<Col xs="0" sm="1" md="3" />
		<Col xs="12" sm="10" md="6">
		<Toast style="max-width: 100%;" light>
			<ToastHeader>
				<strong>Что у Вас нового?</strong>
			</ToastHeader>
			<ToastBody>
				<InputGroup size="sm" style="padding-bottom: 10px;">
					<Input placeholder="tag" type="text" bind:value={newPost.tag} />
					<InputGroupAddon addonType="append">
						<Button class="btn-success" size="sm" on:click={addPost}>Добавить</Button>
					</InputGroupAddon>
				</InputGroup>
				<Input type="textarea" bind:value={newPost.body} />
			</ToastBody>
		</Toast>
		<Toast style="max-width: 100%;" light>
			<ToastHeader>
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
				<Button class="btn-info" size="sm" style="margin-right: 6px;" on:click={filterByTag({ tag })}>{ tag }</Button>
				{/each}
			</ToastBody>
		</Toast>
		{#each posts as post}
		<Toast style="max-width: 100%;" light>
      <ToastHeader>
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
