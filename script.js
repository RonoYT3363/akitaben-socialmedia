function addPost() {

    const input = document.getElementById("postInput");
    const posts = document.getElementById("posts");

    const text = input.value.trim();

    if (text === "") {
        alert("投稿内容を入力してください");
        return;
    }

    const post = document.createElement("div");
    post.className = "post";

    post.textContent = text;

    posts.prepend(post);

    input.value = "";
}
