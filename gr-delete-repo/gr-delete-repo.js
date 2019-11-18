// Copyright (C) 2018 The Android Open Source Project
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
(function() {
  'use strict';

  let checkIsReplicated = () => document.querySelector('gr-delete-repo').textContent.includes('replicated');

  Polymer({
    //The 'is' property specifies a HTML tag name for the custom element
    is: 'gr-delete-repo',

    properties: {
        repoName: String,
        isReplicated: Boolean,
        config: Object,
        action: Object,
        actionId: String,
    },

    attached() {
      this.actionId = this.plugin.getPluginName() + '~delete';
      this.action = this.config.actions[this.actionId];
      this.hidden = !this.action;
      this.isReplicated = checkIsReplicated.call();
    },

    _handleCommandTap() {
      this.$.deleteRepoOverlay.open();
    },

    _handleCloseDeleteRepo() {
      this.$.deleteRepoOverlay.close();
    },

    _handleDeleteRepo() {
      const endpoint = '/projects/' +
          encodeURIComponent(this.repoName) + '/' +
          this.actionId;

      //This is a json object. It is private to the _handleDeleteRepo function
      //due to the scope chain.
      let json = {};
      if(this.isReplicated){
          let e = document.getElementById("gitPreserveOptions");
          let selectedOption = e.options[e.selectedIndex].value;

          if(selectedOption === 'preserveDelete'){
            json = {
              force: this.$.forceDeleteOpenChangesCheckBox.checked,
              preserve:true,
            };
          } else if (selectedOption === 'archiveAndRemove'){
            json = {
              force: this.$.forceDeleteOpenChangesCheckBox.checked,
              preserve:false,
            };
            window.alert('The replicated project ' + this.repoName + ' was deleted: "');
          }

      } else {
          //NON REPLICATED REPO PATH
          json = {
              force: this.$.forceDeleteOpenChangesCheckBox.checked,
              preserve: this.$.preserveGitRepoCheckBox.checked
          };
      }

      const errFn = response => {
        this.fire('page-error', {response});
      };

      return this.plugin.restApi().send(
          this.action.method, endpoint, json, errFn)
            .then(r => {
              this.plugin.restApi().invalidateReposCache();
              Gerrit.Nav.navigateToRelativeUrl('/admin/repos');
      });
    },

   });
})();
