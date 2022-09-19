import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Post } from './post.model';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' }) // also creates singleton like adding it to app.module providers[]
export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], postCount: number}>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, currentPage: number) {
    // don't want to return the original -- which would be the reference type with this.post
    // return [...this.posts];\
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http
      .get<{
        message: string,
        posts: any,
        maxPosts: number
      }>('http://localhost:3000/api/posts' + queryParams)
      // pipe allows us to add in an operator
      .pipe(
        map((postData) => {
          return { posts: postData.posts.map((post) => {
            return {
              id: post._id,
              word: post.word,
              definition: post.definition,
              partOfSpeech: post.partOfSpeech,
              use: post.use,
              imagePath: post.imagePath
            };
          }), maxPosts: postData.maxPosts};
        })
      )
      .subscribe((transformedPostData) => {
        // don't need to unsubscribe on ngOnDestroy bc for observables connected to features built into Angular it will be handled
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: transformedPostData.maxPosts});
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{
      _id: string,
      word: string,
      definition: string,
      partOfSpeech: string,
      use: string,
      imagePath: string
    }>('http://localhost:3000/api/posts/' + id);
  }

  addPost(
    word: string,
    definition: string,
    partOfSpeech: string,
    use: string,
    image: File
  ) {
    const postData = new FormData(); // text and blob values
    postData.append('word', word);
    postData.append('definition', definition);
    postData.append('partOfSpeech', partOfSpeech);
    postData.append('use', use);
    postData.append('image', image, word);
    this.http
      .post<{ message: string; post: Post }>(
        'http://localhost:3000/api/posts',
        postData
      )
      .subscribe(responseData => {
        // we will fetch these posts anyways when you navigate
        // const post: Post = {
        //   id: responseData.post.id,
        //   word: word,
        //   definition: definition,
        //   partOfSpeech: partOfSpeech,
        //   use: use,
        //   imagePath: responseData.post.imagePath
        // };
        // // const id = responseData.postId;
        // // post.id = id;
        // this.posts.push(post);
        // this.postsUpdated.next([...this.posts]);
        // console.log(post);
        this.router.navigate(['/']); // going to home page after successfully adding
      });
    // this.posts.push(post); // optiminstic updating can be put within the subscribe method
    // this.postsUpdated.next([...this.posts]); // copy of post after updating from prev line
  }

  updatePost(
    id: string,
    word: string,
    definition: string,
    partOfSpeech: string,
    use: string,
    image: File | string
  ) {
    let postData: Post | FormData;
    if (typeof(image) === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', word);
      postData.append('definition', definition);
      postData.append('partOfSpeech', partOfSpeech);
      postData.append('use', use);
      postData.append('image', image, word);
    } else {
        postData = {
          id: id,
          word: word,
          definition: definition,
          partOfSpeech: partOfSpeech,
          use: use,
          imagePath: image
        }
    }
    const post: Post = {
      id: id,
      word: word,
      definition: definition,
      partOfSpeech: partOfSpeech,
      use: use,
      imagePath: null
    };
    this.http
      .put('http://localhost:3000/api/posts/' + id, postData)
      .subscribe((response) => {
        // const updatedPosts = [...this.posts];
        // const oldPostIndex = updatedPosts.findIndex((p) => p.id === id);
        // const post: Post = {
        //     id: id,
        //     word: word,
        //     definition: definition,
        //     partOfSpeech: partOfSpeech,
        //     use: use,
        //     imagePath: "response.imagePath"
        // }
        // updatedPosts[oldPostIndex] = post;
        // this.posts = updatedPosts;
        // this.postsUpdated.next([...this.posts]);
        this.router.navigate(['/']);
      });
    console.log(post);
  }

  deletePost(postId: string) {
    return this.http
      .delete('http://localhost:3000/api/posts/' + postId);
      // we're now subscribing in the post list componenent
      // .subscribe(() => {
      //   const updatedPosts = this.posts.filter((post) => post.id !== postId);
      //   this.posts = updatedPosts;
      //   console.log(updatedPosts);
      //   this.postsUpdated.next([...this.posts]);
      // });
  }
}
