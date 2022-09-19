import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post.model';
import { PostService } from '../posts.service';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html', // only 1
  styleUrls: ['./post-create.component.css'], // can have multiple
})
export class PostCreateComponent implements OnInit {
  enteredWord = '';
  enteredDefinition = '';
  post: Post;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  private mode = 'create';
  private postId: string;

  constructor(public postService: PostService, public route: ActivatedRoute) {} // activated route holds info about route we're currently on

  // create vs edit mode
  ngOnInit() {
    this.form = new FormGroup({
      word: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      definition: new FormControl(null, {
        validators: [Validators.required] // reference to method required
      }),
      partOfSpeech: new FormControl(null),
      use: new FormControl(null),
      image: new FormControl(null, {
        asyncValidators: [mimeType]
      }),
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      // observable paramap listen to changes in route url with params
      if (paramMap.has('postId') && paramMap.get('postId') !== null) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true; // loading screen
        this.postService.getPost(this.postId).subscribe(postData => {
          this.isLoading = false;
          this.post = {
            id: postData._id,
            word: postData.word,
            definition: postData.definition,
            partOfSpeech: postData.partOfSpeech,
            use: postData.use,
            imagePath: postData.imagePath
          };
          this.form.setValue({
            word: this.post.word,
            definition: this.post.definition,
            partOfSpeech: this.post.partOfSpeech,
            use: this.post.use,
            image: this.post.imagePath
          });
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0]; // file the user selected is first in this array
    this.form.patchValue({ image: file });
    this.form.get('image').updateValueAndValidity(); // tells angular I changed the value, and it shoudl reeval, store internally, and validate it
    const reader = new FileReader();
    reader.onload = () => {
      // after done loading
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSavePost() {
    if (this.form.invalid) {
      // will have to do validation here as well but can take validation results of html
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      this.postService.addPost(
        this.form.value.word,
        this.form.value.definition,
        this.form.value.partOfSpeech,
        this.form.value.use,
        this.form.value.image
      );
    } else {
      this.postService.updatePost(
        this.postId,
        this.form.value.word,
        this.form.value.definition,
        this.form.value.partOfSpeech,
        this.form.value.use,
        this.form.value.image
      );
    }
    this.form.reset();
  }
}
