import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TripService } from '../../../core/services/trip.service';

@Component({
  selector: 'app-trip-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './trip-editor.component.html',
  styleUrls: ['./trip-editor.component.scss'],
})
export class TripEditorComponent implements OnInit {
  form: FormGroup;
  isEditing = false;
  tripId: string | null = null;
  saving = false;
  error = '';
  tags: string[] = [];
  tagInput = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private tripService: TripService
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      startDate: [''],
      endDate: [''],
      status: ['DRAFT'],
      isPublic: [false],
    });
  }

  ngOnInit() {
    this.tripId = this.route.snapshot.paramMap.get('id');
    if (this.tripId) {
      this.isEditing = true;
      this.tripService.getTrip(this.tripId).subscribe({
        next: ({ trip }) => {
          this.form.patchValue({
            title: trip.title,
            description: trip.description ?? '',
            startDate: trip.startDate ? trip.startDate.split('T')[0] : '',
            endDate: trip.endDate ? trip.endDate.split('T')[0] : '',
            status: trip.status,
            isPublic: trip.isPublic,
          });
          this.tags = trip.tags.map((t) => t.tag.name);
        },
      });
    }
  }

  addTag(event: Event) {
    event.preventDefault();
    const val = this.tagInput.trim().replace(/,$/, '').toLowerCase();
    if (val && !this.tags.includes(val)) this.tags.push(val);
    this.tagInput = '';
  }

  removeTag(tag: string) {
    this.tags = this.tags.filter((t) => t !== tag);
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.saving = true;
    this.error = '';

    const payload = {
      ...this.form.value,
      tags: this.tags,
      startDate: this.form.value.startDate || undefined,
      endDate: this.form.value.endDate || undefined,
    };

    const request$ = this.isEditing
      ? this.tripService.updateTrip(this.tripId!, payload)
      : this.tripService.createTrip(payload);

    request$.subscribe({
      next: (res) => {
        console.log('Trip saved:', res);
        this.saving = false;
        this.router.navigate(['/trips', res.trip.id]);
      },
      error: (err) => {
        console.error('Trip error:', err);
        this.error = err.error?.error ?? 'Something went wrong. Please try again.';
        this.saving = false;
      },
    });
  }
}
