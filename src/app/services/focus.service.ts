import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  FocusSettings,
  FocusSettingsUpdate,
  PomodoroSession,
  PomodoroSessionAbandon,
  PomodoroSessionStart,
  PomodoroSessionSync,
} from '../models/focus';

@Injectable({
  providedIn: 'root',
})
export class FocusService {
  constructor(private http: HttpClient) {}

  getSettings(userId: string): Observable<FocusSettings> {
    return this.http.get<FocusSettings>(`${environment.url}/focus/settings/${userId}`);
  }

  updateSettings(userId: string, payload: FocusSettingsUpdate): Observable<FocusSettings> {
    return this.http.put<FocusSettings>(`${environment.url}/focus/settings/${userId}`, payload);
  }

  getActiveSession(userId: string): Observable<PomodoroSession | null> {
    return this.http.get<PomodoroSession | null>(
      `${environment.url}/focus/sessions/${userId}/active`
    );
  }

  startSession(userId: string, payload: PomodoroSessionStart): Observable<PomodoroSession> {
    return this.http.post<PomodoroSession>(
      `${environment.url}/focus/sessions/${userId}`,
      payload
    );
  }

  pauseSession(
    userId: string,
    sessionId: string,
    payload: PomodoroSessionSync
  ): Observable<PomodoroSession> {
    return this.http.put<PomodoroSession>(
      `${environment.url}/focus/sessions/${userId}/${sessionId}/pause`,
      payload
    );
  }

  resumeSession(userId: string, sessionId: string): Observable<PomodoroSession> {
    return this.http.put<PomodoroSession>(
      `${environment.url}/focus/sessions/${userId}/${sessionId}/resume`,
      {}
    );
  }

  syncSession(
    userId: string,
    sessionId: string,
    payload: PomodoroSessionSync
  ): Observable<PomodoroSession> {
    return this.http.put<PomodoroSession>(
      `${environment.url}/focus/sessions/${userId}/${sessionId}/sync`,
      payload
    );
  }

  completeSession(
    userId: string,
    sessionId: string,
    payload: PomodoroSessionSync
  ): Observable<PomodoroSession> {
    return this.http.put<PomodoroSession>(
      `${environment.url}/focus/sessions/${userId}/${sessionId}/complete`,
      payload
    );
  }

  abandonSession(
    userId: string,
    sessionId: string,
    payload: PomodoroSessionAbandon
  ): Observable<PomodoroSession> {
    return this.http.put<PomodoroSession>(
      `${environment.url}/focus/sessions/${userId}/${sessionId}/abandon`,
      payload
    );
  }
}
