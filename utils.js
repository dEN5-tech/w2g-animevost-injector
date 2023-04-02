import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

class useState {
  constructor(initialValue) {
    this._value = new BehaviorSubject(initialValue);
  }

  get value() {
    return this._value.getValue();
  }

  set value(newValue) {
    this._value.next(newValue);
  }

  subscribe(next) {
    return this._value.subscribe(next);
  }

  unsubscribe() {
    this._value.unsubscribe();
  }
}




function onMessage(messageType) {
  return new Observable(observer => {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === messageType) {
        observer.next(message.payload);
      }
    });
  });
}

exports = {
    onMessage,
    useState
}