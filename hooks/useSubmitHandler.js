import { useCallback } from 'react';

function useSubmitHandler(isSubmitEnabled, loading, handleSubmit, onSubmit) {
  const handleSubmitEditing = useCallback(() => {
    if (isSubmitEnabled && !loading) {
      if (handleSubmit && onSubmit) {
        handleSubmit(onSubmit)();
      }
    }
  }, [isSubmitEnabled, loading, handleSubmit, onSubmit]);

  return handleSubmitEditing;
}

export default useSubmitHandler;