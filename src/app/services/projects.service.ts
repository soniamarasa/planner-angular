import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Item } from '../models/item';
import { Project, ProjectPayload, UnassignedSummary } from '../models/project';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  constructor(private http: HttpClient) {}

  getProjects(userId: User['id'], includeArchived = false): Observable<Project[]> {
    let params = new HttpParams();
    if (includeArchived) {
      params = params.set('include_archived', 'true');
    }
    return this.http.get<Project[]>(`${environment.url}/getProjects/${userId}`, { params });
  }

  getUnassignedSummary(userId: User['id']): Observable<UnassignedSummary> {
    return this.http.get<UnassignedSummary>(`${environment.url}/getUnassignedSummary/${userId}`);
  }

  getUnassignedItems(userId: User['id'], includeFinished = true): Observable<Item[]> {
    let params = new HttpParams();
    if (!includeFinished) {
      params = params.set('include_finished', 'false');
    }
    return this.http.get<Item[]>(`${environment.url}/getUnassignedItems/${userId}`, { params });
  }

  createProject(userId: User['id'], payload: ProjectPayload): Observable<Project> {
    return this.http.post<Project>(`${environment.url}/postProject/${userId}`, payload);
  }

  updateProject(userId: User['id'], projectId: string, payload: Partial<ProjectPayload>): Observable<Project> {
    return this.http.put<Project>(`${environment.url}/editProject/${userId}/${projectId}`, payload);
  }

  getProjectItems(userId: User['id'], projectId: string, includeFinished = true): Observable<Item[]> {
    let params = new HttpParams();
    if (!includeFinished) {
      params = params.set('include_finished', 'false');
    }
    return this.http.get<Item[]>(`${environment.url}/getProjectItems/${userId}/${projectId}`, { params });
  }
}
