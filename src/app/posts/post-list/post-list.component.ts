import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { Post } from '../post.model';
import { PostService } from '../posts.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {

  posts: Post[]  = [];
  isLoading = false;
  totalPosts = 0;
  postsPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1,2,5,10];
  private postsSub: Subscription = new Subscription();


  constructor(public postService: PostService) {}

  ngOnInit() { // auto when creates component
    this.isLoading = true;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
    this.postsSub = this.postService.getPostUpdateListener()
      .subscribe((postData: {posts: Post[], postCount: number}) => {
        this.isLoading = false;
        this.totalPosts = postData.postCount;
        this.posts = postData.posts;
      }); // sets up subscription (fx when new data emitted, when new error emitted, whenever obx is completed)
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage =  pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.postService.deletePost(postId).subscribe(() => {
      this.postService.getPosts(this.postsPerPage, this.currentPage);
    });
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe(); // prevents memory leaks
  }

  // posts = [
  //   {title: 'A Humongous Ass', content: 'Dylan\'s baht'},
  //   {title: 'Nice Guy TM', content: 'Man tipping fedora'},
  //   {title: 'Cursed Code', content: 'Broken UI project'}
  // ];

}
