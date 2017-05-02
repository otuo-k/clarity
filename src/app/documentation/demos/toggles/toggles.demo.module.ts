/*
 * Copyright (c) 2016 - 2017 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ClarityModule} from "clarity-angular";

import {TogglesDemo} from "./toggles.demo";
import {TogglesExampleDemo} from "./toggles-example.demo";
import {DocWrapperModule} from "../_doc-wrapper/doc-wrapper.module";
import {RouterModule} from "@angular/router";

@NgModule({
    imports: [
        CommonModule,
        ClarityModule.forChild(),
        DocWrapperModule,
        RouterModule
    ],
    declarations: [
        TogglesExampleDemo,
        TogglesDemo
    ],
    exports: [
        TogglesDemo
    ]
})
export class TogglesDemoModule {
}
