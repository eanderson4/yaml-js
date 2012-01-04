(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; }, __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (__hasProp.call(this, i) && this[i] === item) return i; } return -1; };

  module.exports = (function() {
    var YAMLError, nodes, _;

    function exports() {}

    _ = require('underscore');

    nodes = require('./nodes');

    YAMLError = require('./errors').YAMLError;

    exports.ResolverError = (function() {

      __extends(ResolverError, YAMLError);

      function ResolverError() {
        ResolverError.__super__.constructor.apply(this, arguments);
      }

      return ResolverError;

    })();

    exports.BaseResolver = (function() {
      var DEFAULT_MAPPING_TAG, DEFAULT_SCALAR_TAG, DEFAULT_SEQUENCE_TAG;

      DEFAULT_SCALAR_TAG = 'tag:yaml.org,2002:str';

      DEFAULT_SEQUENCE_TAG = 'tag:yaml.org,2002:seq';

      DEFAULT_MAPPING_TAG = 'tag:yaml.org,2002:map';

      BaseResolver.prototype.yaml_implicit_resolvers = {};

      BaseResolver.prototype.yaml_path_resolvers = {};

      BaseResolver.add_implicit_resolver = function(tag, regexp, first) {
        var char, _base, _i, _len, _ref, _results;
        if (first === null) first = [null];
        _results = [];
        for (_i = 0, _len = first.length; _i < _len; _i++) {
          char = first[_i];
          _results.push(((_ref = (_base = this.prototype.yaml_implicit_resolvers)[char]) != null ? _ref : _base[char] = []).push([tag, regexp]));
        }
        return _results;
      };

      function BaseResolver() {
        this.resolver_exact_paths = [];
        this.resolver_prefix_paths = [];
      }

      BaseResolver.prototype.descend_resolver = function(current_node, current_index) {
        var depth, exact_paths, kind, path, prefix_paths, _i, _j, _len, _len2, _ref, _ref2, _ref3, _ref4;
        if (_.isEmpty(this.yaml_path_resolvers)) return;
        exact_paths = {};
        prefix_paths = [];
        if (current_node) {
          depth = this.resolver_prefix_paths.length;
          _ref = this.resolver_prefix_paths.slice(-1)[0];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            _ref2 = _ref[_i], path = _ref2[0], kind = _ref2[1];
            if (this.check_resolver_prefix(depth, path, kind, current_node, current_index)) {
              if (path.length > depth) {
                prefix_paths.push([path, kind]);
              } else {
                exact_paths[kind] = this.yaml_path_resolvers[path][kind];
              }
            }
          }
        } else {
          _ref3 = this.yaml_path_resolvers;
          for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
            _ref4 = _ref3[_j], path = _ref4[0], kind = _ref4[1];
            if (!path) {
              exact_paths[kind] = this.yaml_path_resolvers[path][kind];
            } else {
              prefix_paths.push([path, kind]);
            }
          }
        }
        this.resolver_exact_paths.push(exact_paths);
        return this.resolver_prefix_paths.push(prefix_paths);
      };

      BaseResolver.prototype.ascend_resolver = function() {
        if (_.isEmpty(this.yaml_path_resolvers)) return;
        this.resolver_exact_paths.pop();
        return this.resolver_prefix_paths.pop();
      };

      BaseResolver.prototype.check_resolver_prefix = function(depth, path, kind, current_node, current_index) {
        var index_check, node_check, _ref;
        _ref = path[depth - 1], node_check = _ref[0], index_check = _ref[1];
        if (typeof node_check === 'string') {
          if (current_node.tag !== node_check) return;
        } else if (node_check !== null) {
          if (!(current_node instanceof node_check)) return;
        }
        if (index_check === true && current_index !== null) return;
        if ((index_check === false || index_check === null) && current_index === null) {
          return;
        }
        if (typeof index_check === 'string') {
          if (!(current_index instanceof nodes.ScalarNode) && index_check === current_index.value) {
            return;
          }
        } else if (typeof index_check === 'number') {
          if (index_check !== current_index) return;
        }
        return true;
      };

      BaseResolver.prototype.resolve = function(kind, value, implicit) {
        var empty, exact_paths, k, regexp, resolvers, tag, _i, _len, _ref, _ref2, _ref3, _ref4;
        if (kind === nodes.ScalarNode && implicit[0]) {
          if (value === '') {
            resolvers = (_ref = this.yaml_implicit_resolvers['']) != null ? _ref : [];
          } else {
            resolvers = (_ref2 = this.yaml_implicit_resolvers[value[0]]) != null ? _ref2 : [];
          }
          resolvers = resolvers.concat((_ref3 = this.yaml_implicit_resolvers[null]) != null ? _ref3 : []);
          for (_i = 0, _len = resolvers.length; _i < _len; _i++) {
            _ref4 = resolvers[_i], tag = _ref4[0], regexp = _ref4[1];
            if (value.match(regexp)) return tag;
          }
          implicit = implicit[1];
        }
        empty = true;
        for (k in this.yaml_path_resolvers) {
          if ({}[k] == null) empty = false;
        }
        if (!empty) {
          exact_paths = this.resolver_exact_paths.slice(-1)[0];
          if (__indexOf.call(exact_paths, kind) >= 0) return exact_paths[kind];
          if (__indexOf.call(exact_paths, null) >= 0) return exact_paths[null];
        }
        if (kind === nodes.ScalarNode) return DEFAULT_SCALAR_TAG;
        if (kind === nodes.SequenceNode) return DEFAULT_SEQUENCE_TAG;
        if (kind === nodes.MappingNode) return DEFAULT_MAPPING_TAG;
      };

      return BaseResolver;

    })();

    exports.Resolver = (function() {

      __extends(Resolver, exports.BaseResolver);

      function Resolver() {
        Resolver.__super__.constructor.apply(this, arguments);
      }

      Resolver.prototype.yaml_implicit_resolvers = {};

      Resolver.prototype.yaml_path_resolvers = {};

      return Resolver;

    })();

    exports.Resolver.add_implicit_resolver('tag:yaml.org,2002:bool', /^(?:yes|Yes|YES|true|True|TRUE|on|On|ON|no|No|NO|false|False|FALSE|off|Off|OFF)$/, 'yYnNtTfFoO');

    exports.Resolver.add_implicit_resolver('tag:yaml.org,2002:float', /^(?:[-+]?(?:[0-9][0-9_]*)\.[0-9_]*(?:[eE][-+][0-9]+)?|\.[0-9_]+(?:[eE][-+][0-9]+)?|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*|[-+]?\.(?:inf|Inf|INF)|\.(?:nan|NaN|NAN))$/, '-+0123456789.');

    exports.Resolver.add_implicit_resolver('tag:yaml.org,2002:int', /^(?:[-+]?0b[01_]+|[-+]?0[0-7_]+|[-+]?(?:0|[1-9][0-9_]*)|[-+]?0x[0-9a-fA-F_]+|[-+]?0o[0-7_]+|[-+]?[1-9][0-9_]*(?::[0-5]?[0-9])+)$/, '-+0123456789');

    exports.Resolver.add_implicit_resolver('tag:yaml.org,2002:merge', /^(?:<<)$/, '<');

    exports.Resolver.add_implicit_resolver('tag:yaml.org,2002:null', /^(?:~|null|Null|NULL|)$/, ['~', 'n', 'N', '']);

    exports.Resolver.add_implicit_resolver('tag:yaml.org,2002:timestamp', /^(?:[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]|[0-9][0-9][0-9][0-9]-[0-9][0-9]?-[0-9][0-9]?(?:[Tt]|[\x20\t]+)[0-9][0-9]?:[0-9][0-9]:[0-9][0-9](?:\.[0-9]*)?(?:[\x20\t]*(?:Z|[-+][0-9][0-9]?(?::[0-9][0-9])?))?)$/, '0123456789');

    exports.Resolver.add_implicit_resolver('tag:yaml.org,2002:value', /^(?:=)$/, '=');

    exports.Resolver.add_implicit_resolver('tag:yaml.org,2002:yaml', /^(?:!|&|\*)$/, '!&*');

    return exports;

  }).call(this);

}).call(this);