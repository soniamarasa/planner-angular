import { DynamicDialogConfig } from 'primeng/dynamicdialog';

export const PLANNER_DIALOG_STYLE_CLASS = 'modal planner-dialog';
export const PLANNER_DIALOG_MASK_CLASS = 'planner-dialog-mask';

export function plannerDialogStyleClass(theme: string): string {
  return `${theme} ${PLANNER_DIALOG_STYLE_CLASS}`;
}

export function plannerDialogConfig(
  theme: string,
  config: DynamicDialogConfig = {}
): DynamicDialogConfig {
  return {
    appendTo: 'body',
    closable: true,
    closeOnEscape: true,
    styleClass: plannerDialogStyleClass(theme),
    maskStyleClass: PLANNER_DIALOG_MASK_CLASS,
    ...config,
  };
}
